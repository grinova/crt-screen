import { TextureShader } from '../shaders/texture'

export class FX<T extends TextureShader = TextureShader> {
  readonly shader: T
  readonly xScale: number
  readonly yScale: number

  constructor(shader: T, xScale: number = 1, yScale: number = 1) {
    this.shader = shader
    this.xScale = xScale
    this.yScale = yScale
  }
}
