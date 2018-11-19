import { Size } from '../common/size'

export interface Buffer {
  destroy(): void
  getFrameBuffer(): WebGLFramebuffer
  getSize(): Size
  getTexture(): WebGLTexture
  resize(width: number, height: number): void
}
