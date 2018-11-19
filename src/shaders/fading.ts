import { FeedbackTextureShader } from './feedback'
import { VS_SOURCE } from './texture'
import { Program } from '../program/program'
import { UniformFloat } from '../var/uniform-float'

const FS_SOURCE =
`#version 300 es
precision mediump float;

uniform int on;
uniform float uDuration;
uniform sampler2D uInputTexture;
uniform sampler2D uFeedbackTexture;
uniform vec2 uResolution;
in vec2 vTexcoord;
out vec4 oFragColor;

#define N 3
#define EDGE 0.5
#define DELTA 0.002

vec4 fade(sampler2D fadeTexture, ivec2 texelCoord, float duration) {
  vec4 color = texelFetch(fadeTexture, texelCoord, 0);
  color = min(color, vec4(EDGE));
  vec4 xn = vec4(1.0);
  for (int i = 0; i < N - 1; i++) {
    xn *= color;
  }
  color -= max(vec4(DELTA), float(N) * vec4(duration) * xn);
  color = max(vec4(0.0), color);
  return color;
}

void main() {
  ivec2 texelCoord = ivec2(vTexcoord * uResolution);
  if (on == 0) {
    oFragColor = texelFetch(uInputTexture, texelCoord, 0);
    return;
  }
  vec4 color = texelFetch(uInputTexture, texelCoord, 0);
  vec4 f = fade(uFeedbackTexture, texelCoord, uDuration);
  oFragColor = max(color, f);
}`

export class FadingShader extends FeedbackTextureShader {
  readonly duration: UniformFloat

  constructor(gl: WebGLRenderingContext) {
    const program = new Program(gl, VS_SOURCE, FS_SOURCE)
    super(gl, program)
    this.duration = new UniformFloat(this.program, 'uDuration')
    this.addVars(this.duration)
  }
}
