import { TextureShader, VS_SOURCE } from './texture'
import { Program } from '../program/program'
import { UniformFloat } from '../var/uniform-float'

const FS_SOURCE =
`#version 300 es
precision highp float;

uniform int on;
uniform sampler2D uInputTexture;
uniform float uMinEdge;
uniform float uMaxEdge;
uniform float uPxSize;
uniform vec2 uResolution;
in vec2 vTexcoord;
out vec4 oFragColor;

void main() {
  ivec2 texelCoord = ivec2(vTexcoord * uResolution);
  vec4 color = texelFetch(uInputTexture, texelCoord, 0);
  if (on == 0) {
    oFragColor = color;
    return;
  }
  vec2 margin = mod(gl_FragCoord.xy, uPxSize)/*  / uPxSize */;
  if (margin.y <= uMinEdge) {
    color *= vec4(1.0, 0.5, 0.25, 0.75);
  }
  if (margin.y >= uMaxEdge) {
    color *= vec4(0.25, 0.5, 1.0, 0.75);
  }
  if (margin.x <= uMinEdge) {
    color *= vec4(0.5, 0.75, 1.0, 0.5);
  }
  if (margin.x >= uMaxEdge) {
    color *= vec4(1.0, 0.75, 0.5, 0.5);
  }
  oFragColor = color;
}`

export interface PixelizationShaderOptions {
  pxsize: number
  minEdge: number
  maxEdge: number
}

export class PixelizationShader extends TextureShader {
  constructor(
    gl: WebGLRenderingContext,
    options: PixelizationShaderOptions,
    program: Program = new Program(gl, VS_SOURCE, FS_SOURCE)
  ) {
    super(gl, program)
    this.addVars(
      new UniformFloat(this.program, 'uPxSize', options.pxsize),
      new UniformFloat(this.program, 'uMinEdge', options.minEdge),
      new UniformFloat(this.program, 'uMaxEdge', options.maxEdge)
    )
  }
}
