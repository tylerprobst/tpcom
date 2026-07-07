export const beadVertexShader = /* glsl */ `
uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vFresnel;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewPosition = -mvPosition.xyz;
  vFresnel = pow(1.0 - max(dot(vNormal, normalize(vViewPosition)), 0.0), 2.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const beadFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uPull;
uniform float uHot;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vFresnel;

void main() {
  vec3 core = vec3(0.97, 0.94, 0.88);
  vec3 mid = vec3(0.72, 0.82, 0.92);
  vec3 edge = vec3(0.32, 0.42, 0.52);

  float facing = 1.0 - vFresnel;
  vec3 color = mix(edge, mid, smoothstep(0.0, 0.75, facing));
  color = mix(color, core, smoothstep(0.3, 1.0, facing));

  float heat = uHot * uPull;
  color += vec3(1.0, 0.88, 0.7) * heat * 0.5;
  color += vec3(0.55, 0.72, 0.95) * vFresnel * heat * 0.45;

  float pulse = sin(uTime * 3.0 + uHot * 5.0) * heat * 0.1 + 1.0;
  gl_FragColor = vec4(color * pulse, 1.0);
}
`;