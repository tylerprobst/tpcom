import {
  CURL_STRENGTH,
  DENSITY_DISSIPATION,
  DENSITY_DISSIPATION_MOBILE,
  FIXED_TIMESTEP,
  INTENSITY_SCALE,
  MAX_FRAME_DELTA,
  MAX_POINTER_STEP,
  MAX_POINTER_STEP_TOUCH,
  POINTER_SMOOTH_RATE,
  TOUCH_INTENSITY_BOOST,
  PRESSURE_ITERATIONS,
  SPLAT_FORCE,
  SPLAT_RADIUS,
  VELOCITY_DISSIPATION,
  createFluidPointer,
  type FluidPointer,
} from "./fluidConstants";
import {
  ADVECT_FRAG,
  CLEAR_FRAG,
  CURL_FRAG,
  DISPLAY_FRAG,
  DIVERGENCE_FRAG,
  FLUID_VERTEX_SHADER,
  GRADIENT_SUBTRACT_FRAG,
  PRESSURE_FRAG,
  SPLAT_FRAG,
  VORTICITY_FRAG,
} from "./fluidShaders";

type GL = WebGL2RenderingContext;

type FBO = {
  texture: WebGLTexture;
  fbo: WebGLFramebuffer;
  width: number;
  height: number;
  texelSizeX: number;
  texelSizeY: number;
};

type Program = {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
};

function compileShader(gl: GL, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Failed to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${log}`);
  }
  return shader;
}

function createProgram(gl: GL, vert: string, frag: string): WebGLProgram {
  const program = gl.createProgram();
  if (!program) throw new Error("Failed to create program");
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vert));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, frag));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    throw new Error(`Program link error: ${log}`);
  }
  return program;
}

function wrapProgram(
  gl: GL,
  vert: string,
  frag: string,
  uniformNames: string[],
): Program {
  const program = createProgram(gl, vert, frag);
  const uniforms: Record<string, WebGLUniformLocation | null> = {};
  for (const name of uniformNames) {
    uniforms[name] = gl.getUniformLocation(program, name);
  }
  return { program, uniforms };
}

function createFBO(gl: GL, width: number, height: number, filter: number): FBO {
  const texture = gl.createTexture();
  if (!texture) throw new Error("Failed to create texture");

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA16F,
    width,
    height,
    0,
    gl.RGBA,
    gl.HALF_FLOAT,
    null,
  );

  const fbo = gl.createFramebuffer();
  if (!fbo) throw new Error("Failed to create framebuffer");

  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0,
  );

  if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
    throw new Error("Framebuffer incomplete");
  }

  gl.viewport(0, 0, width, height);
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return {
    texture,
    fbo,
    width,
    height,
    texelSizeX: 1 / width,
    texelSizeY: 1 / height,
  };
}

function createDoubleFBO(
  gl: GL,
  width: number,
  height: number,
  filter: number,
): [FBO, FBO] {
  return [createFBO(gl, width, height, filter), createFBO(gl, width, height, filter)];
}

function swapDouble<T>(pair: [T, T]): void {
  const tmp = pair[0];
  pair[0] = pair[1];
  pair[1] = tmp;
}

export class FluidSolver {
  private gl: GL;
  private canvas: HTMLCanvasElement;
  private simRes: number;
  private isMobile: boolean;
  private aspect = 1;
  private displayWidth = 0;
  private displayHeight = 0;
  private densityDissipation: number;

  private quad: WebGLBuffer;
  private vao: WebGLVertexArrayObject;

  private velocity: [FBO, FBO];
  private dye: [FBO, FBO];
  private pressure: [FBO, FBO];
  private divergence: FBO;
  private curl: FBO;

  private advect: Program;
  private splatProg: Program;
  private divergenceProg: Program;
  private pressureProg: Program;
  private gradientProg: Program;
  private curlProg: Program;
  private vorticityProg: Program;
  private clearProg: Program;
  private displayProg: Program;

  private lastTime = 0;
  private elapsed = 0;
  private accumulator = 0;
  private pointer = createFluidPointer();

  constructor(canvas: HTMLCanvasElement, simRes: number, isMobile = false) {
    const gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
    }) as GL | null;

    if (!gl) throw new Error("WebGL2 is required for the fluid simulation");
    if (!gl.getExtension("EXT_color_buffer_float")) {
      throw new Error("EXT_color_buffer_float is required");
    }

    this.gl = gl;
    this.canvas = canvas;
    this.simRes = simRes;
    this.isMobile = isMobile;
    this.densityDissipation = isMobile
      ? DENSITY_DISSIPATION_MOBILE
      : DENSITY_DISSIPATION;

    this.quad = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.quad);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]),
      gl.STATIC_DRAW,
    );

    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const linear = gl.LINEAR;
    const nearest = gl.NEAREST;
    this.velocity = createDoubleFBO(gl, simRes, simRes, linear);
    this.dye = createDoubleFBO(gl, simRes, simRes, linear);
    this.pressure = createDoubleFBO(gl, simRes, simRes, nearest);
    this.divergence = createFBO(gl, simRes, simRes, nearest);
    this.curl = createFBO(gl, simRes, simRes, nearest);

    this.advect = wrapProgram(gl, FLUID_VERTEX_SHADER, ADVECT_FRAG, [
      "uVelocity",
      "uSource",
      "uTexelSize",
      "uDt",
      "uDissipation",
    ]);
    this.splatProg = wrapProgram(gl, FLUID_VERTEX_SHADER, SPLAT_FRAG, [
      "uTarget",
      "uAspect",
      "uPoint",
      "uColor",
      "uRadius",
    ]);
    this.divergenceProg = wrapProgram(gl, FLUID_VERTEX_SHADER, DIVERGENCE_FRAG, [
      "uVelocity",
      "uTexelSize",
    ]);
    this.pressureProg = wrapProgram(gl, FLUID_VERTEX_SHADER, PRESSURE_FRAG, [
      "uPressure",
      "uDivergence",
      "uTexelSize",
    ]);
    this.gradientProg = wrapProgram(gl, FLUID_VERTEX_SHADER, GRADIENT_SUBTRACT_FRAG, [
      "uPressure",
      "uVelocity",
      "uTexelSize",
    ]);
    this.curlProg = wrapProgram(gl, FLUID_VERTEX_SHADER, CURL_FRAG, [
      "uVelocity",
      "uTexelSize",
    ]);
    this.vorticityProg = wrapProgram(gl, FLUID_VERTEX_SHADER, VORTICITY_FRAG, [
      "uVelocity",
      "uCurl",
      "uTexelSize",
      "uCurlStrength",
      "uDt",
    ]);
    this.clearProg = wrapProgram(gl, FLUID_VERTEX_SHADER, CLEAR_FRAG, [
      "uTexture",
      "uValue",
    ]);
    this.displayProg = wrapProgram(gl, FLUID_VERTEX_SHADER, DISPLAY_FRAG, [
      "uDye",
      "uTime",
    ]);

    this.resize();
    this.seedAmbient();
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(this.canvas.clientWidth * dpr);
    const h = Math.floor(this.canvas.clientHeight * dpr);
    if (w === 0 || h === 0) return;
    if (w === this.displayWidth && h === this.displayHeight) return;

    this.displayWidth = w;
    this.displayHeight = h;
    this.canvas.width = w;
    this.canvas.height = h;
    this.aspect = w / h;

    const gl = this.gl;
    gl.viewport(0, 0, w, h);
  }

  private bind(target: FBO | null): void {
    const gl = this.gl;
    if (target) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
      gl.viewport(0, 0, target.width, target.height);
    } else {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    }
    gl.bindVertexArray(this.vao);
  }

  private blit(program: Program, setup: () => void): void {
    const gl = this.gl;
    gl.useProgram(program.program);
    setup();
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
  }

  private advectPass(
    target: FBO,
    velocity: FBO,
    source: FBO,
    dissipation: number,
    dt: number,
  ): void {
    this.bind(target);
    this.blit(this.advect, () => {
      const gl = this.gl;
      const u = this.advect.uniforms;
      gl.uniform1i(u.uVelocity, 0);
      gl.uniform1i(u.uSource, 1);
      gl.uniform2f(u.uTexelSize, velocity.texelSizeX, velocity.texelSizeY);
      gl.uniform1f(u.uDt, dt);
      gl.uniform1f(u.uDissipation, dissipation);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, velocity.texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, source.texture);
    });
  }

  private splat(
    read: FBO,
    write: FBO,
    pointX: number,
    pointY: number,
    color: [number, number, number],
    radius: number,
  ): void {
    this.bind(write);
    this.blit(this.splatProg, () => {
      const gl = this.gl;
      const u = this.splatProg.uniforms;
      gl.uniform1i(u.uTarget, 0);
      gl.uniform1f(u.uAspect, this.aspect);
      gl.uniform3f(u.uPoint, pointX, pointY, 0);
      gl.uniform3f(u.uColor, color[0], color[1], color[2]);
      gl.uniform1f(u.uRadius, radius);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, read.texture);
    });
  }

  splatPointer(
    x: number,
    y: number,
    dx: number,
    dy: number,
    intensity = 1,
  ): void {
    const forceX = dx * SPLAT_FORCE * intensity;
    const forceY = dy * SPLAT_FORCE * intensity;
    const speed = Math.sqrt(dx * dx + dy * dy);

    this.splat(
      this.velocity[0],
      this.velocity[1],
      x,
      y,
      [forceX, forceY, 0],
      SPLAT_RADIUS,
    );
    swapDouble(this.velocity);

    const amount = (0.3 + speed * 3.5) * INTENSITY_SCALE;
    this.splat(
      this.dye[0],
      this.dye[1],
      x,
      y,
      [amount * 0.96, amount * 0.98, amount * 0.94],
      SPLAT_RADIUS * 1.35,
    );
    swapDouble(this.dye);
  }

  private seedAmbient(): void {
    const s = INTENSITY_SCALE;
    const g = (v: number) => v * s;
    const spots: Array<[number, number, [number, number, number], number]> = [
      [0.5, 0.5, [g(0.22), g(0.23), g(0.24)], 5],
      [0.12, 0.12, [g(0.18), g(0.19), g(0.2)], 7],
      [0.88, 0.12, [g(0.19), g(0.2), g(0.21)], 7],
      [0.12, 0.88, [g(0.18), g(0.19), g(0.2)], 7],
      [0.88, 0.88, [g(0.19), g(0.2), g(0.21)], 7],
      [0.5, 0.1, [g(0.17), g(0.18), g(0.19)], 6],
      [0.5, 0.9, [g(0.17), g(0.18), g(0.19)], 6],
      [0.1, 0.5, [g(0.17), g(0.18), g(0.19)], 6],
      [0.9, 0.5, [g(0.17), g(0.18), g(0.19)], 6],
      [0.35, 0.65, [g(0.2), g(0.21), g(0.22)], 5],
      [0.65, 0.35, [g(0.2), g(0.21), g(0.22)], 5],
    ];

    for (const [x, y, dye, radius] of spots) {
      this.splat(
        this.velocity[0],
        this.velocity[1],
        x,
        y,
        [0.0014, -0.001, 0],
        SPLAT_RADIUS * radius,
      );
      swapDouble(this.velocity);

      this.splat(
        this.dye[0],
        this.dye[1],
        x,
        y,
        dye,
        SPLAT_RADIUS * (radius + 1),
      );
      swapDouble(this.dye);
    }
  }

  step(dt: number, reducedMotion: boolean): void {
    const gl = this.gl;
    const simDt = reducedMotion ? dt * 0.35 : Math.min(dt, 0.033);

    this.advectPass(
      this.velocity[1],
      this.velocity[0],
      this.velocity[0],
      VELOCITY_DISSIPATION,
      simDt,
    );
    swapDouble(this.velocity);

    this.advectPass(
      this.dye[1],
      this.velocity[0],
      this.dye[0],
      this.densityDissipation,
      simDt,
    );
    swapDouble(this.dye);

    this.bind(this.curl);
    this.blit(this.curlProg, () => {
      const u = this.curlProg.uniforms;
      gl.uniform1i(u.uVelocity, 0);
      gl.uniform2f(u.uTexelSize, this.velocity[0].texelSizeX, this.velocity[0].texelSizeY);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.velocity[0].texture);
    });

    this.bind(this.velocity[1]);
    this.blit(this.vorticityProg, () => {
      const u = this.vorticityProg.uniforms;
      gl.uniform1i(u.uVelocity, 0);
      gl.uniform1i(u.uCurl, 1);
      gl.uniform2f(u.uTexelSize, this.velocity[0].texelSizeX, this.velocity[0].texelSizeY);
      gl.uniform1f(u.uCurlStrength, reducedMotion ? CURL_STRENGTH * 0.4 : CURL_STRENGTH);
      gl.uniform1f(u.uDt, simDt);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.velocity[0].texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.curl.texture);
    });
    swapDouble(this.velocity);

    this.bind(this.divergence);
    this.blit(this.divergenceProg, () => {
      const u = this.divergenceProg.uniforms;
      gl.uniform1i(u.uVelocity, 0);
      gl.uniform2f(u.uTexelSize, this.velocity[0].texelSizeX, this.velocity[0].texelSizeY);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.velocity[0].texture);
    });

    this.bind(this.pressure[1]);
    this.blit(this.clearProg, () => {
      const u = this.clearProg.uniforms;
      gl.uniform1i(u.uTexture, 0);
      gl.uniform1f(u.uValue, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.pressure[0].texture);
    });
    swapDouble(this.pressure);

    for (let i = 0; i < PRESSURE_ITERATIONS; i++) {
      this.bind(this.pressure[1]);
      this.blit(this.pressureProg, () => {
        const u = this.pressureProg.uniforms;
        gl.uniform1i(u.uPressure, 0);
        gl.uniform1i(u.uDivergence, 1);
        gl.uniform2f(u.uTexelSize, this.pressure[0].texelSizeX, this.pressure[0].texelSizeY);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.pressure[0].texture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.divergence.texture);
      });
      swapDouble(this.pressure);
    }

    this.bind(this.velocity[1]);
    this.blit(this.gradientProg, () => {
      const u = this.gradientProg.uniforms;
      gl.uniform1i(u.uPressure, 0);
      gl.uniform1i(u.uVelocity, 1);
      gl.uniform2f(u.uTexelSize, this.velocity[0].texelSizeX, this.velocity[0].texelSizeY);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.pressure[0].texture);
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D, this.velocity[0].texture);
    });
    swapDouble(this.velocity);

  }

  setPointer(
    x: number,
    y: number,
    down: boolean,
    active: boolean,
    touch = false,
  ): void {
    const wasDown = this.pointer.down;
    this.pointer.targetX = x;
    this.pointer.targetY = y;
    this.pointer.down = down;
    this.pointer.active = active;
    this.pointer.touch = touch;

    if (down && !wasDown) {
      this.pointer.smoothX = x;
      this.pointer.smoothY = y;
      this.pointer.prevX = x;
      this.pointer.prevY = y;
      const clickIntensity = touch ? 0.65 : 0.5;
      this.splatPointer(x, y, 0, 0, clickIntensity);
    }
  }

  feedTouch(x: number, y: number, dx: number, dy: number): void {
    const p = this.pointer;
    p.targetX = x;
    p.targetY = y;
    p.smoothX = x;
    p.smoothY = y;
    p.prevX = x;
    p.prevY = y;
    p.down = true;
    p.active = true;
    p.touch = true;

    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed < 0.00002) return;

    let sdx = dx;
    let sdy = dy;
    if (speed > MAX_POINTER_STEP_TOUCH) {
      const scale = MAX_POINTER_STEP_TOUCH / speed;
      sdx *= scale;
      sdy *= scale;
    }

    const intensity =
      TOUCH_INTENSITY_BOOST * (0.55 + Math.min(speed * 70, 1.1));
    this.splatPointer(x, y, sdx, sdy, intensity);
  }

  private applyPointerInput(dt: number, reducedMotion: boolean): void {
    const p = this.pointer;
    const blend = 1 - Math.exp(-dt * POINTER_SMOOTH_RATE);
    p.smoothX += (p.targetX - p.smoothX) * blend;
    p.smoothY += (p.targetY - p.smoothY) * blend;

    if (reducedMotion || !p.active || p.touch) return;

    let dx = p.smoothX - p.prevX;
    let dy = p.smoothY - p.prevY;
    p.prevX = p.smoothX;
    p.prevY = p.smoothY;

    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed < 0.00002) return;

    if (speed > MAX_POINTER_STEP) {
      const scale = MAX_POINTER_STEP / speed;
      dx *= scale;
      dy *= scale;
    }

    const intensity = p.down
      ? 0.55 + Math.min(speed * 70, 1.1)
      : 0.32 + Math.min(speed * 52, 0.8);
    this.splatPointer(p.smoothX, p.smoothY, dx, dy, intensity);
  }

  render(): void {
    const gl = this.gl;
    this.bind(null);
    this.blit(this.displayProg, () => {
      const u = this.displayProg.uniforms;
      gl.uniform1i(u.uDye, 0);
      gl.uniform1f(u.uTime, this.elapsed);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, this.dye[0].texture);
    });
  }

  tick(reducedMotion: boolean): void {
    const now = performance.now();
    if (this.lastTime === 0) this.lastTime = now;
    const frameDt = Math.min((now - this.lastTime) / 1000, MAX_FRAME_DELTA);
    this.lastTime = now;
    this.elapsed += frameDt;
    this.accumulator += frameDt;

    while (this.accumulator >= FIXED_TIMESTEP) {
      this.applyPointerInput(FIXED_TIMESTEP, reducedMotion);
      this.step(FIXED_TIMESTEP, reducedMotion);
      this.accumulator -= FIXED_TIMESTEP;
    }

    this.render();
  }

  destroy(): void {
    const gl = this.gl;
    const textures = [
      this.velocity[0].texture,
      this.velocity[1].texture,
      this.dye[0].texture,
      this.dye[1].texture,
      this.pressure[0].texture,
      this.pressure[1].texture,
      this.divergence.texture,
      this.curl.texture,
    ];
    const fbos = [
      this.velocity[0].fbo,
      this.velocity[1].fbo,
      this.dye[0].fbo,
      this.dye[1].fbo,
      this.pressure[0].fbo,
      this.pressure[1].fbo,
      this.divergence.fbo,
      this.curl.fbo,
    ];

    for (const tex of textures) gl.deleteTexture(tex);
    for (const fbo of fbos) gl.deleteFramebuffer(fbo);
    gl.deleteBuffer(this.quad);
    gl.deleteVertexArray(this.vao);
  }
}