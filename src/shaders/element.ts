import { BuffersShader, VariablesOptions } from './buffers'
import { Camera } from '../camera'
import { Program } from '../program/program'
import { Elements } from '../var/elements'

export class ElementShader extends BuffersShader {
  private static readonly DEFAULT_ELEMENTS_COUNT = 512

  mode: GLenum
  offset: number = 0
  count: number = 0

  readonly indicesCount: number

  private indices: Elements

  constructor(
    gl: WebGLRenderingContext,
    camera: Camera,
    indicesCount: number = ElementShader.DEFAULT_ELEMENTS_COUNT,
    verticesCount: number = indicesCount,
    program?: Program,
    variablesOptions?: VariablesOptions
  ) {
    super(gl, camera, verticesCount, program, variablesOptions)
    this.mode = gl.POINTS
    this.indicesCount = indicesCount
    this.indices = new Elements(this.program, new Uint16Array(this.indicesCount))
    this.addVars(this.indices)
  }

  element(i?: number): void {
    if (i == null) {
      i = this.indices.getCount()
    }
    this.indices.add(i)
    this.offset = 0
    this.count = this.indices.getCount()
  }

  getElementsCount(): number {
    return this.indices.getCount()
  }

  flush(): void {
    if (this.count == 0) {
      return
    }
    super.flush()
    const { gl } = this.program
    gl.drawElements(this.mode, this.count, gl.UNSIGNED_SHORT, this.offset * 2)
  }

  resetBuffers(): void {
    super.resetBuffers()
    this.indices.reset()
  }

  bufferData(): void {
    this.indices.loadBuffer()
    super.bufferData()
  }
}
