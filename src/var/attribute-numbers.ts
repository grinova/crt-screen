import { AttributeVar } from './attribute-var'
import { Program } from '../program/program'

export class AttributeNumbers extends AttributeVar<Float32Array> {
  readonly elementSize: number
  private buffer: WebGLBuffer
  private offset: number = 0

  constructor(program: Program, name: string, elementSize: number, value: Float32Array) {
    super(program, name, value)
    this.elementSize = elementSize
    this.buffer = program.gl.createBuffer()
  }

  add(...v: number[]): void {
    for (let i = 0; i < v.length; i++) {
      this.value[this.offset++] = v[i]
    }
  }

  bufferData(): void {
    const { gl } = this.program
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ARRAY_BUFFER, this.value, gl.STATIC_DRAW)
  }

  getOffset(): number {
    return this.offset
  }

  reset(): void {
    this.offset = 0
  }

  update(): void {
    const { gl } = this.program
    gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer)
    gl.vertexAttribPointer(this.location, this.elementSize, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(this.location)
  }
}
