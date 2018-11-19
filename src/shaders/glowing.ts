import { TextureShader, VS_SOURCE } from './texture'
import { Program } from '../program/program'
import { UniformFloat } from '../var/uniform-float'

const FS_SOURCE =
`#version 300 es
precision mediump float;

uniform int on;
uniform float uCoef;
uniform vec2 uResolution;
uniform sampler2D uInputTexture;
in vec2 vTexcoord;
out vec4 oFragColor;

float lighting(int x, int y, float r) {
  return max(0.0, (r - sqrt(float(x * x + y * y))) / r);
}

#define RADIUS 3
#define RADIUS_EDGE 1
#define N 2

vec4 glow(sampler2D inputTexture, ivec2 texelCoord, float m, float r) {
  vec4 color = texelFetch(inputTexture, texelCoord, 0);
  vec4 sum = vec4(0.0);
  for (int x = -RADIUS; x <= RADIUS; x++) {
    for (int y = -RADIUS; y <= RADIUS; y++) {
      vec4 neighbour = texelFetch(inputTexture, texelCoord + ivec2(x, y), 0);
      float l = lighting(x, y, r);
      sum += neighbour * l * m;
    }
  }
  sum += color;
  return min(vec4(1.0), sum);
}

void main() {
  ivec2 texelCoord = ivec2(vTexcoord * uResolution);
  if (on == 0) {
    oFragColor = texelFetch(uInputTexture, texelCoord, 0);
    return;
  }
  float r = float(RADIUS + RADIUS_EDGE);
  vec4 color = glow(uInputTexture, texelCoord, uCoef, r);
  oFragColor = color;
}`

export class GlowingShader extends TextureShader {
  readonly coef: UniformFloat

  constructor(gl: WebGLRenderingContext, coef: number) {
    const program = new Program(gl, VS_SOURCE, FS_SOURCE)
    super(gl, program)
    this.coef = new UniformFloat(this.program, 'uCoef', coef)
    this.addVars(this.coef)
  }
}
