export const signalVertexShader = /* glsl */ `
attribute float aGlyph;
attribute float aWeight;
attribute float aDisplace;

uniform float uTime;
uniform float uPixelRatio;

varying float vGlyph;
varying float vDisplace;
varying float vWeight;

void main() {
  vGlyph = aGlyph;
  vDisplace = aDisplace;
  vWeight = aWeight;

  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

  float baseSize = mix(1.2, 3.4, aWeight) * mix(0.75, 1.35, aGlyph);
  float pulse = 1.0 + sin(uTime * 2.2 + position.x * 14.0 + position.y * 9.0) * 0.07 * aGlyph;
  float stretch = 1.0 + min(aDisplace * 2.8, 1.6);

  gl_PointSize = baseSize * stretch * pulse * uPixelRatio * (300.0 / -mvPosition.z);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const signalFragmentShader = /* glsl */ `
varying float vGlyph;
varying float vDisplace;
varying float vWeight;

void main() {
  vec2 uv = gl_PointCoord - 0.5;
  float d = length(uv);
  if (d > 0.5) discard;

  float core = smoothstep(0.5, 0.0, d);
  core = pow(core, 1.5);

  vec3 cream = vec3(0.97, 0.94, 0.88);
  vec3 cool = vec3(0.52, 0.66, 0.80);
  vec3 flare = vec3(0.82, 0.90, 1.0);

  vec3 color = mix(cool, cream, vGlyph * 0.9);
  color = mix(color, flare, clamp(vDisplace * 1.4, 0.0, 1.0));

  float alpha = core * mix(0.28, 0.92, vGlyph) * (0.55 + vWeight * 0.45);
  gl_FragColor = vec4(color, alpha);
}
`;