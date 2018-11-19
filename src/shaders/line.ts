import { Color, Vec2 } from 'classic2d'
import { DEFAULT_VARIABLES_OPTIONS } from './buffers'
import { ElementShader } from './element'
import { Camera } from '../camera'

export class LineShader extends ElementShader {
  private static readonly DEFAULT_LINES_COUNT = 256
  private static readonly LINE_VERTICES = 2

  constructor(
    gl: WebGLRenderingContext,
    camera: Camera,
    indicesCount: number = LineShader.DEFAULT_LINES_COUNT * LineShader.LINE_VERTICES
  ) {
    super(gl, camera, indicesCount)
    this.mode = gl.LINES
  }

  add(ps: Vec2[], cs: Color[]): void {
    const len = Math.min(ps.length, cs.length)
    if (len == 0) {
      return
    }
    const vertecies = this.getAttrubute(DEFAULT_VARIABLES_OPTIONS.vertex.name)
    const colors = this.getAttrubute(DEFAULT_VARIABLES_OPTIONS.color.name)
    if (!vertecies || !colors) {
      return
    }
    for (let i = 0; i < len; i++) {
      if (this.getElementsCount() >= this.indicesCount) {
        this.flush()
      }
      for (const p of ps) {
        vertecies.add(p.x, p.y)
        this.element()
      }
      for (const c of cs) {
        colors.add(...c)
      }
    }
  }
}
