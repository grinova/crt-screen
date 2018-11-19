import { Var } from './var'
import { Program } from '../program/program'

export class Elements implements Var {
  readonly elements: Uint16Array
  readonly program: Program
  private buffer: WebGLBuffer
  private offset: number = 0

  constructor(program: Program, elements: Uint16Array) {
    this.program = program
    this.elements = elements
    this.buffer = program.gl.createBuffer()
  }

  destroy(): void {
    this.program.gl.deleteBuffer(this.buffer)
  }

  add(n: number): void {
    this.elements[this.offset++] = n
  }

  getCount(): number {
    return this.offset
  }

  loadBuffer(): void {
    const { gl } = this.program
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.elements, gl.STATIC_DRAW)
  }

  reset(): void {
    this.offset = 0
  }

  update(): void {
    this.program.gl.bindBuffer(this.program.gl.ELEMENT_ARRAY_BUFFER, this.buffer)
  }
}
