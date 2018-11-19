import { Buffer } from '../buffer/buffer'
import { clear } from '../helpers'

export class RenderingDirection {
  protected gl: WebGLRenderingContext
  private buffer: void | Buffer

  constructor(gl: WebGLRenderingContext, buffer?: void | Buffer) {
    this.gl = gl
    this.buffer = buffer
  }

  clear(): void {
    clear(this.gl)
  }

  use(): void {
    const { gl } = this
    if (this.buffer) {
      const { width, height } = this.buffer.getSize()
      gl.viewport(0, 0, width, height)
      gl.bindFramebuffer(gl.FRAMEBUFFER, this.buffer.getFrameBuffer())
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.buffer.getTexture(), 0)
    } else {
      const { width, height } = gl.canvas
      gl.viewport(0, 0, width, height)
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, null, 0)
      gl.bindFramebuffer(gl.FRAMEBUFFER, null)
    }
  }
}
