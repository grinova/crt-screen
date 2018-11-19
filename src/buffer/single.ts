import { Buffer } from './buffer'
import { Size } from '../common/size'
import {
  createTexture,
  ParameterizeTexture,
  resizeTexture
} from '../helpers'

export class SingleBuffer implements Buffer {
  protected gl: WebGLRenderingContext
  protected fbo: WebGLFramebuffer
  protected texture: WebGLTexture
  private size: Size

  constructor(gl: WebGLRenderingContext, width: number, height: number, parameterize?: void | ParameterizeTexture) {
    this.gl = gl
    this.size = { width, height }
    this.fbo = gl.createFramebuffer()
    this.texture = createTexture(gl, width, height, parameterize)
  }

  destroy(): void {
    this.gl.deleteFramebuffer(this.fbo)
    this.gl.deleteTexture(this.texture)
  }

  getFrameBuffer(): WebGLFramebuffer {
    return this.fbo
  }

  getSize(): Size {
    return this.size
  }

  getTexture(): WebGLTexture {
    return this.texture
  }

  resize(width: number, height: number): void {
    resizeTexture(this.gl, this.texture, width, height)
    this.size.width = width
    this.size.height = height
  }
}
