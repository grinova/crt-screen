import { SingleBuffer } from './single'
import {
  createTexture,
  ParameterizeTexture,
  resizeTexture
} from '../helpers'

export class DoubleBuffer extends SingleBuffer {
  private secondTexture: WebGLTexture

  constructor(gl: WebGLRenderingContext, width: number, height: number, parameterize?: void | ParameterizeTexture) {
    super(gl, width, height, parameterize)
    this.secondTexture = createTexture(gl, width, height, parameterize)
  }

  destroy(): void {
    super.destroy()
    this.gl.deleteTexture(this.secondTexture)
  }

  getSecondTexture(): WebGLTexture {
    return this.secondTexture
  }

  resize(width: number, height: number): void {
    super.resize(width, height)
    resizeTexture(this.gl, this.secondTexture, width, height)
  }

  swap(): void {
    [this.texture, this.secondTexture] = [this.secondTexture, this.texture]
  }
}
