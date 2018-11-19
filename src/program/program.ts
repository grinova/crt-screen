import { initShaderProgram } from '../helpers'

export class Program {
  readonly gl: WebGLRenderingContext
  readonly p: WebGLProgram

  constructor(gl: WebGLRenderingContext, vs: string, fs: string) {
    this.gl = gl
    this.p = initShaderProgram(gl, vs, fs)
  }

  destroy(): void {
    this.gl.deleteProgram(this.p)
  }
}
