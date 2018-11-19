import { Mat4, Vec2 } from 'classic2d'

export class Camera {
  private static readonly K = 100
  private static readonly ZOOM_K = 10 / 9

  center: Vec2
  zoom: number
  width: number
  height: number

  constructor(x: number, y: number, zoom: number, width: number, height: number) {
    this.center = new Vec2(x, y)
    this.zoom = zoom
    this.width = width
    this.height = height
  }

  buildProjectionMatrix(): Mat4 {
    const near = 0.1
    const far = 100.0
    const right = this.width / (2 * Camera.K)
    const left = -right
    const top = this.height / (2 * Camera.K)
    const bottom = -top
    const projection = Mat4.ortho(left, right, bottom, top, near, far)
    projection.translate(0, 0, -10)
    const z = Math.pow(Camera.ZOOM_K, this.zoom)
    projection.scale(z, z, z)
    projection.translate(-this.center.x, -this.center.y)
    return projection
  }

  move(offset: Vec2): void {
    const x = offset.x / Camera.K
    const y = offset.y / Camera.K
    const z = Math.pow(Camera.ZOOM_K, this.zoom)
    this.center.x += x / z
    this.center.y += y / z
  }
}
