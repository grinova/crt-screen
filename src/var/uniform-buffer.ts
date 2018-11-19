import { UniformVar } from './uniform-var'
import { Buffer } from '../buffer/buffer'
import { Program } from '../program/program'

export class UniformBuffer<T extends Buffer = Buffer> extends UniformVar<T> {
  private textureUnit: GLenum
  private textureIndex: number

  constructor(program: Program, name: string, textureIndex: number, value?: void | T) {
    super(program, name, value)
    this.textureIndex = textureIndex
    this.textureUnit = program.gl.TEXTURE0 + textureIndex
  }

  update(): void {
    const { gl } = this.program
    gl.activeTexture(this.textureUnit)
    gl.bindTexture(gl.TEXTURE_2D, this.value.getTexture())
    gl.uniform1i(this.location, this.textureIndex)
  }
}
