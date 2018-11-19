import { LineShader } from './line'
import { Camera } from '../camera'

export class TriangleShader extends LineShader {
  private static readonly DEFAULT_TRIANGLES_COUNT = 256
  private static readonly TRIANGLE_VERTICES = 3

  constructor(
    gl: WebGLRenderingContext,
    camera: Camera,
    indicesCount: number = TriangleShader.DEFAULT_TRIANGLES_COUNT * TriangleShader.TRIANGLE_VERTICES,
  ) {
    super(gl, camera, indicesCount)
    this.mode = gl.TRIANGLES
  }
}
