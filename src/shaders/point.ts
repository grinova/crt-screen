import { Color, Vec2 } from 'classic2d'
import { DEFAULT_VARIABLES_OPTIONS } from './buffers'
import { ElementShader } from './element'
import { Camera } from '../camera'

export class PointShader extends ElementShader {
  constructor(gl: WebGLRenderingContext, camera: Camera) {
    super(gl, camera)
    this.mode = gl.POINTS
  }

  add(vertex: Vec2, color: Color): void {
    if (this.getElementsCount() >= this.indicesCount) {
      this.flush()
    }
    const vertecies = this.getAttrubute(DEFAULT_VARIABLES_OPTIONS.vertex.name)
    const colors = this.getAttrubute(DEFAULT_VARIABLES_OPTIONS.color.name)
    vertecies && vertecies.add(vertex.x, vertex.y)
    colors && colors.add(...color)
    super.element()
  }
}
