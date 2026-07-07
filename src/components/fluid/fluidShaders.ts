const VERT = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aPosition;
out vec2 vUv;

void main() {
  vUv = aPosition * 0.5 + 0.5;
  gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

export const ADVECT_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 uTexelSize;
uniform float uDt;
uniform float uDissipation;

void main() {
  vec2 coord = vUv - uDt * texture(uVelocity, vUv).xy;
  fragColor = uDissipation * texture(uSource, coord);
}
`;

export const SPLAT_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTarget;
uniform float uAspect;
uniform vec3 uPoint;
uniform vec3 uColor;
uniform float uRadius;

void main() {
  vec2 p = vUv - uPoint.xy;
  p.x *= uAspect;
  float weight = exp(-dot(p, p) / uRadius);
  vec3 base = texture(uTarget, vUv).xyz;
  fragColor = vec4(base + uColor * weight, 1.0);
}
`;

export const DIVERGENCE_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform vec2 uTexelSize;

void main() {
  float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
  float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
  float div = 0.5 * (R - L + T - B);
  fragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

export const PRESSURE_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexelSize;

void main() {
  float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  float div = texture(uDivergence, vUv).x;
  float pressure = (L + R + B + T - div) * 0.25;
  fragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`;

export const GRADIENT_SUBTRACT_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uPressure;
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;

void main() {
  float L = texture(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity -= vec2(R - L, T - B);
  fragColor = vec4(velocity, 0.0, 1.0);
}
`;

export const CURL_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform vec2 uTexelSize;

void main() {
  float L = texture(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
  float R = texture(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
  float T = texture(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
  float curl = R - L - T + B;
  fragColor = vec4(0.5 * curl, 0.0, 0.0, 1.0);
}
`;

export const VORTICITY_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexelSize;
uniform float uCurlStrength;
uniform float uDt;

void main() {
  float L = texture(uCurl, vUv - vec2(uTexelSize.x, 0.0)).x;
  float R = texture(uCurl, vUv + vec2(uTexelSize.x, 0.0)).x;
  float T = texture(uCurl, vUv + vec2(0.0, uTexelSize.y)).x;
  float B = texture(uCurl, vUv - vec2(0.0, uTexelSize.y)).x;
  float C = texture(uCurl, vUv).x;

  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
  force /= length(force) + 0.0001;
  force *= uCurlStrength * C;
  force.y *= -1.0;

  vec2 velocity = texture(uVelocity, vUv).xy;
  velocity += force * uDt;
  fragColor = vec4(velocity, 0.0, 1.0);
}
`;

export const CLEAR_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uTexture;
uniform float uValue;

void main() {
  fragColor = uValue * texture(uTexture, vUv);
}
`;

export const DISPLAY_FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 fragColor;

uniform sampler2D uDye;
uniform float uTime;

void main() {
  vec3 dye = texture(uDye, vUv).rgb;
  float energy = length(dye);

  vec3 bg = vec3(0.024, 0.031, 0.047);
  vec3 mist = vec3(0.46, 0.48, 0.50);
  vec3 slate = vec3(0.30, 0.33, 0.36);
  vec3 deep = vec3(0.11, 0.13, 0.16);

  vec3 col = bg;
  col = mix(col, deep, smoothstep(0.02, 0.42, dye.b) * 0.55);
  col = mix(col, slate, smoothstep(0.04, 0.62, dye.g) * 0.5);
  col = mix(col, mist, smoothstep(0.05, 0.82, dye.r) * 0.42);
  col += mist * pow(energy, 2.0) * 0.045;

  float grain = fract(sin(dot(vUv * 240.0, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.01;

  fragColor = vec4(col, 1.0);
}
`;

export const FLUID_VERTEX_SHADER = VERT;