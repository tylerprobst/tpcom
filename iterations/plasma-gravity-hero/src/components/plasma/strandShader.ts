export const strandVertexShader = /* glsl */ `
uniform float uPinch;
uniform float uThick;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vAlong;
varying float vFresnel;

void main() {
  vAlong = position.y + 0.5;

  float base = 1.0 - uPinch * pow(1.0 - vAlong, 2.2);
  float tip = 0.55 + vAlong * 0.45;
  float radius = uThick * mix(base, tip, vAlong);

  vec3 p = vec3(position.x * radius, position.y, position.z * radius);

  vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
  vNormal = normalize(normalMatrix * normal);
  vViewPosition = -mvPosition.xyz;
  vFresnel = pow(1.0 - max(dot(vNormal, normalize(vViewPosition)), 0.0), 2.0);

  gl_Position = projectionMatrix * mvPosition;
}
`;

export const strandFragmentShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vAlong;
varying float vFresnel;

void main() {
  vec3 coreColor = vec3(0.93, 0.90, 0.84);
  vec3 midColor = vec3(0.74, 0.79, 0.85);
  vec3 edgeColor = vec3(0.42, 0.51, 0.58);

  float facing = 1.0 - vFresnel;
  vec3 color = mix(edgeColor, midColor, smoothstep(0.0, 0.7, facing));
  color = mix(color, coreColor, smoothstep(0.35, 1.0, facing) * (0.65 + vAlong * 0.35));

  float neck = 1.0 - smoothstep(0.0, 0.35, vAlong) * 0.15;
  color *= neck;

  gl_FragColor = vec4(color, 1.0);
}
`;