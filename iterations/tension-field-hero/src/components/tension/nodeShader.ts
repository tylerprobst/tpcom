export const nodeVertexShader = /* glsl */ `
attribute float aStrain;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vFresnel;
varying float vStrain;

void main() {
  vStrain = aStrain;
  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
  vViewPosition = -mvPosition.xyz;
  vFresnel = pow(1.0 - max(dot(vNormal, normalize(vViewPosition)), 0.0), 2.0);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const nodeFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uPull;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vFresnel;
varying float vStrain;

void main() {
  vec3 core = vec3(0.97, 0.94, 0.88);
  vec3 mid = vec3(0.72, 0.82, 0.92);
  vec3 edge = vec3(0.32, 0.42, 0.52);

  float facing = 1.0 - vFresnel;
  vec3 color = mix(edge, mid, smoothstep(0.0, 0.75, facing));
  color = mix(color, core, smoothstep(0.3, 1.0, facing));

  float heat = vStrain * uPull;
  color += vec3(0.95, 0.82, 0.65) * heat * 0.55;
  color += vec3(0.6, 0.75, 0.95) * vFresnel * uPull * 0.35;

  float pulse = sin(uTime * 3.5 + vStrain * 8.0) * heat * 0.08 + 1.0;
  gl_FragColor = vec4(color * pulse, 1.0);
}
`;