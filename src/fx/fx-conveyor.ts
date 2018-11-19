import { FX } from './fx'
import { Link } from './link'
import { Buffer } from '../buffer/buffer'
import { SingleBuffer } from '../buffer/single'
import { ParameterizeTexture } from '../helpers'

export class FxConveyor {
  private gl: WebGLRenderingContext
  private parameterize: void | ParameterizeTexture

  private inputBuffer: Buffer
  private links: Link[] = []

  private buffers: Buffer[] = []

  constructor(gl: WebGLRenderingContext, inputBuffer: Buffer, parameterize?: void | ParameterizeTexture) {
    this.gl = gl
    this.inputBuffer = inputBuffer
    this.parameterize = parameterize
  }

  destroy(): void {
    for (const buffer of this.buffers) {
      buffer.destroy()
    }
  }

  addFx(fx: FX, outputBuffer?: void | Buffer): void {
    const lastLink = this.links[this.links.length - 1]
    let inputBuffer: Buffer
    if (lastLink) {
      if (!lastLink.outputBuffer) {
        const { width, height } = lastLink.inputBuffer.getSize()
        const buffer = new SingleBuffer(
          this.gl,
          width * lastLink.fx.xScale,
          height * lastLink.fx.yScale,
          this.parameterize
        )
        this.buffers.push(buffer)
        lastLink.outputBuffer = buffer
      }
      inputBuffer = lastLink.outputBuffer
    } else {
      inputBuffer = this.inputBuffer
    }
    this.links.push(new Link(this.gl, fx, inputBuffer, outputBuffer))
  }

  resize(width: number, height: number): void {
    let w = width
    let h = height
    for (let i = 0; i < this.links.length; i++) {
      const link = this.links[i]
      if (!link.outputBuffer) {
        return
      }
      w = w * link.fx.xScale
      h = h * link.fx.yScale
      link.outputBuffer.resize(w, h)
    }

    this.updateProjectionMatrices()
  }

  flush(): void {
    for (let i = 0; i < this.links.length; i++) {
      const link = this.links[i]
      link.process()
    }
  }

  updateProjectionMatrices(): void {
    for (let i = 0; i < this.links.length; i++) {
      const link = this.links[i]
      link.initProjectionMatrix()
    }
  }
}
