import { Vec2 } from 'classic2d'
import { TextureShader } from './texture'
import { Program } from '../program/program'
import { UniformVec2 } from '../var/uniform-vec2'

const VS_SOURCE =
`#version 300 es
in vec4 aVertex;

uniform mat4 uProjectionMatrix;
out vec2 vCoord;

void main() {
  gl_Position = uProjectionMatrix * aVertex;
  vCoord = vec2(aVertex.x * 2.0 - 1.0, 1.0 - aVertex.y * 2.0);
}`

const FS_SOURCE =
`#version 300 es
precision mediump float;

#define RX 2.0
#define RY 3.0

uniform int on;
uniform vec2 uResolution;
uniform sampler2D uInputTexture;
in vec2 vCoord;
out vec4 oFragColor;

void main() {
  if (on == 0) {
    vec2 texcoord = (vCoord + 1.0) / 2.0;
    oFragColor = texelFetch(uInputTexture, ivec2(texcoord * uResolution), 0);
    return;
  }
  vec2 sr = vec2(
    RX * max(1.0, uResolution.x / uResolution.y),
    RY * max(1.0, uResolution.y / uResolution.x)
  );
  sr *= sr;
  vec2 coord = vCoord;
  float sxsy = coord.x * coord.x + coord.y * coord.y;
  vec2 t = (vec2(sxsy) + sr) / sr;
  vec2 curve = coord * t;
  vec2 texcoord = (curve + 1.0) / 2.0;
  if (texcoord.x >= 0.0 && texcoord.x <= 1.0 && texcoord.y >= 0.0 && texcoord.y <= 1.0) {
    oFragColor = texture(uInputTexture, texcoord);
  } else {
    oFragColor = vec4(0.0);
  }
}`

export class ScreenShader extends TextureShader {
  readonly resolution: UniformVec2

  constructor(
    gl: WebGLRenderingContext,
    program: Program = new Program(gl, VS_SOURCE, FS_SOURCE),
  ) {
    super(gl, program)
    this.resolution = new UniformVec2(this.program, 'uResolution', new Vec2())
    this.addVars(this.resolution)
  }

  beforeUpdateVariables(): void {
    super.beforeUpdateVariables && super.beforeUpdateVariables()
    const { width, height } = this.inputBuffer.value.getSize()
    this.resolution.value.set(width, height)
  }
}
