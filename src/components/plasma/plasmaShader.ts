export const plasmaVertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uBreathe;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;
varying float vFresnel;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

float globBulge(vec3 norm, float time) {
  float t = time * 0.12;
  float theta = atan(norm.y, norm.x);
  float phi = acos(clamp(norm.z, -1.0, 1.0));

  float wave1 = sin(phi * 1.5 + t) * cos(theta * 1.3 + t * 0.5);
  float wave2 = sin(phi * 2.0 - t * 0.6) * cos(theta * 1.8 - t * 0.35);
  float drift = snoise(norm * 0.5 + vec3(0.0, t * 0.25, 0.0));

  float raw = wave1 * 0.35 + wave2 * 0.25 + drift * 0.4;
  return smoothstep(-0.3, 0.6, raw);
}

void main() {
  vec3 norm = normalize(normal);
  vec3 pos = position;

  float bulge = globBulge(norm, uTime);
  float breathe = sin(uTime * 0.35) * 0.01 * uBreathe;

  vec3 pointerDir = normalize(vec3(uPointer.x, uPointer.y, 0.75));
  float pointerPull = pow(max(dot(norm, pointerDir), 0.0), 2.0) * uPointerStrength;

  float displacement = bulge * 0.065 + pointerPull * 0.04 + breathe;

  vec3 newPos = pos + norm * displacement;
  vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);

  vNormal = normalize(normalMatrix * norm);
  vViewPosition = -mvPosition.xyz;
  vDisplacement = displacement;
  vFresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), 1.6);

  gl_Position = projectionMatrix * mvPosition;
}
`;

export const plasmaFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uPointerStrength;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vDisplacement;
varying float vFresnel;

void main() {
  vec3 coreColor = vec3(0.93, 0.90, 0.84);
  vec3 midColor = vec3(0.74, 0.79, 0.85);
  vec3 edgeColor = vec3(0.42, 0.51, 0.58);

  float core = smoothstep(-0.02, 0.16, vDisplacement);
  float pulse = sin(uTime * 0.4) * 0.02 + 0.98;

  vec3 color = mix(edgeColor, midColor, smoothstep(0.0, 0.5, core));
  color = mix(color, coreColor, smoothstep(0.35, 1.0, core) * pulse);

  float glow = vFresnel * (0.35 + uPointerStrength * 0.15);
  color += vec3(0.52, 0.64, 0.74) * glow * 0.28;

  float spec = pow(max(dot(vNormal, normalize(vec3(0.2, 0.4, 1.0))), 0.0), 5.0);
  color += vec3(0.95, 0.93, 0.90) * spec * 0.12;

  gl_FragColor = vec4(color, 1.0);
}
`;