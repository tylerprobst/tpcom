export const plasmaVertexShader = /* glsl */ `
uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uBreathe;

varying vec3 vNormal;
varying vec3 vViewPosition;
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

// Seamless 3D noise bulge — no polar coords, no equator band
float sampleBulge(vec3 dir, float time) {
  float t = time * 0.1;
  vec3 drift = vec3(t * 0.08, t * 0.12, t * 0.06);

  float n1 = snoise(dir * 0.8 + drift);
  float n2 = snoise(dir * 1.25 - drift * 0.7) * 0.5;
  float n3 = snoise(dir * 0.55 + drift.yzx) * 0.35;

  return smoothstep(-0.35, 0.55, (n1 + n2 + n3) * 0.45 + 0.5);
}

float displacementAt(vec3 dir, float time, float pointerStr) {
  float bulge = sampleBulge(dir, time);
  float breathe = sin(time * 0.35) * 0.01 * uBreathe;

  vec3 pointerDir = normalize(vec3(uPointer.x, uPointer.y, 0.75));
  float pointerPull = pow(max(dot(dir, pointerDir), 0.0), 2.0) * pointerStr;

  return bulge * 0.06 + pointerPull * 0.038 + breathe;
}

void main() {
  vec3 dir = normalize(position);
  vec3 pos = position;

  float disp = displacementAt(dir, uTime, uPointerStrength);

  // Recompute normal from displacement gradient — removes lighting seam
  vec3 up = abs(dir.y) > 0.99 ? vec3(1.0, 0.0, 0.0) : vec3(0.0, 1.0, 0.0);
  vec3 tangent = normalize(cross(dir, up));
  vec3 bitangent = cross(dir, tangent);
  float eps = 0.015;

  float dispT = displacementAt(normalize(dir + tangent * eps), uTime, uPointerStrength);
  float dispB = displacementAt(normalize(dir + bitangent * eps), uTime, uPointerStrength);

  vec3 surfNormal = normalize(dir - tangent * (dispT - disp) / eps - bitangent * (dispB - disp) / eps);

  vec3 newPos = pos + dir * disp;
  vec4 mvPosition = modelViewMatrix * vec4(newPos, 1.0);

  vNormal = normalize(normalMatrix * surfNormal);
  vViewPosition = -mvPosition.xyz;
  vFresnel = pow(1.0 - max(dot(vNormal, normalize(vViewPosition)), 0.0), 2.0);

  gl_Position = projectionMatrix * mvPosition;
}
`;

export const plasmaFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uPointerStrength;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vFresnel;

void main() {
  vec3 coreColor = vec3(0.93, 0.90, 0.84);
  vec3 midColor = vec3(0.74, 0.79, 0.85);
  vec3 edgeColor = vec3(0.42, 0.51, 0.58);

  // View-based shading only — avoids displacement-driven banding
  float facing = 1.0 - vFresnel;
  float pulse = sin(uTime * 0.4) * 0.015 + 0.985;

  vec3 color = mix(edgeColor, midColor, smoothstep(0.0, 0.75, facing));
  color = mix(color, coreColor, smoothstep(0.45, 1.0, facing) * pulse);

  float glow = vFresnel * (0.3 + uPointerStrength * 0.12);
  color += vec3(0.52, 0.64, 0.74) * glow * 0.22;

  gl_FragColor = vec4(color, 1.0);
}
`;