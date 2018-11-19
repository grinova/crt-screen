import { Vec2 } from 'classic2d'
import { Shader } from './shader'
import { Program } from '../program/program'
import { AttributeNumbers } from '../var/attribute-numbers'
import { UniformBuffer } from '../var/uniform-buffer'
import { UniformBuffers } from '../var/uniform-buffers'
import { UniformInt } from '../var/uniform-int'
import { UniformMat4 } from '../var/uniform-mat4'
import { UniformVec2 } from '../var/uniform-vec2'
import { Var } from '../var/var'

const POSITIONS = [0,0,  0,1,  1,0,  1,0,  0,1,  1,1]
const VERTEX_COUNT = POSITIONS.length / 2

export const VS_SOURCE =
`#version 300 es
in vec4 aVertex;

uniform mat4 uProjectionMatrix;
out vec2 vTexcoord;

void main() {
  gl_Position = uProjectionMatrix * aVertex;
  vTexcoord = vec2(aVertex.x, 1.0 - aVertex.y);
}`

const FS_SOURCE =
`#version 300 es
precision mediump float;

in vec2 vTexcoord;
uniform int on;
uniform sampler2D uInputTexture;
uniform vec2 uResolution;
out vec4 oFragColor;

void main() {
  oFragColor = texelFetch(uInputTexture, ivec2(vTexcoord * uResolution), 0);
}`

export class TextureShader extends Shader {
  readonly vertices: AttributeNumbers
  readonly uniformBuffers: UniformBuffers
  readonly on: UniformInt
  readonly inputBuffer: UniformBuffer
  readonly projectionMatrix: UniformMat4
  readonly resolution: UniformVec2

  constructor(
    gl: WebGLRenderingContext,
    program: Program = new Program(gl, VS_SOURCE, FS_SOURCE),
    ...variables: Var[]
  ) {
    super(program, ...variables)
    this.vertices = new AttributeNumbers(program, 'aVertex', 2, new Float32Array(POSITIONS))
    this.vertices.bufferData()
    this.uniformBuffers = new UniformBuffers(this.program)
    this.on = new UniformInt(this.program, 'on', 1)
    this.inputBuffer = this.uniformBuffers.add('uInputTexture')
    this.projectionMatrix = new UniformMat4(this.program, 'uProjectionMatrix')
    this.resolution = new UniformVec2(this.program, 'uResolution', new Vec2())
    this.addVars(
      this.vertices,
      this.on,
      this.inputBuffer,
      this.projectionMatrix,
      this.resolution
    )
  }

  flush(): void {
    super.flush()
    const { gl } = this.program
    gl.drawArrays(gl.TRIANGLES, 0, VERTEX_COUNT)
  }

  protected beforeUpdateVariables(): void {
    super.beforeUpdateVariables && super.beforeUpdateVariables()
    const { width, height } = this.inputBuffer.value.getSize()
    this.resolution.value.set(width, height)
  }
}
