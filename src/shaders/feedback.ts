import { TextureShader } from './texture'
import { DoubleBuffer } from '../buffer/double'
import { Program } from '../program/program'
import { UniformBuffer } from '../var/uniform-buffer'
import { Var } from '../var/var'

export class FeedbackTextureShader extends TextureShader {
  readonly feedbackBuffer: UniformBuffer<DoubleBuffer>

  constructor(gl: WebGLRenderingContext, program?: Program, ...variables: Var[]) {
    super(gl, program, ...variables)
    this.feedbackBuffer = this.uniformBuffers.add('uFeedbackTexture')
    this.addVars(this.feedbackBuffer)
  }

  protected beforeUpdateVariables(): void {
    super.beforeUpdateVariables && super.beforeUpdateVariables()
    this.feedbackBuffer.value.swap()
  }
}
