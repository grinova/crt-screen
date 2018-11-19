import { FX } from './fx'
import { Buffer } from '../buffer/buffer'
import { createTextureShaderProjectionMatrix } from '../helpers'
import { RenderingDirection } from '../renderers/rendering-direction'

export class Link<T extends FX = FX> {
  inputBuffer: Buffer
  outputBuffer: void | Buffer
  readonly gl: WebGLRenderingContext
  readonly fx: T

  constructor(gl: WebGLRenderingContext, fx: T, inputBuffer: Buffer, outputBuffer?: void | Buffer) {
    this.gl = gl
    this.fx = fx
    this.outputBuffer = outputBuffer
    this.inputBuffer = inputBuffer
  }

  initBuffers(): boolean {
    if (!this.inputBuffer) {
      return false
    }
    this.fx.shader.inputBuffer.value = this.inputBuffer
    return true
  }

  initProjectionMatrix(): void {
    const { width, height } = this.outputBuffer ? this.outputBuffer.getSize() : this.gl.canvas
    const projectionMatrix = createTextureShaderProjectionMatrix(width, height)
    this.fx.shader.projectionMatrix.value = projectionMatrix
  }

  process(): void {
    if (!this.initBuffers()) {
      return
    }
    const direction = new RenderingDirection(this.gl, this.outputBuffer)
    direction.use()
    direction.clear()
    this.fx.shader.flush()
  }
}
