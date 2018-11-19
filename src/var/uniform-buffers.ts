import { UniformBuffer } from './uniform-buffer'
import { Buffer } from '../buffer/buffer'
import { Program } from '../program/program'

export class UniformBuffers {
  private program: Program
  private list: UniformBuffer[] = []

  constructor(program: Program) {
    this.program = program
  }

  add<T extends Buffer = Buffer>(name: string, buffer?: void | T): UniformBuffer<T> {
    const { gl } = this.program
    const i = this.list.length
    if (i >= gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS)) {
      throw new Error('gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS')
    }
    const variable = new UniformBuffer(this.program, name, i, buffer)
    this.list.push(variable)
    return variable
  }
}
