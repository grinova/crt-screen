import { Vec2 } from 'classic2d'
import { UniformVar } from './uniform-var'

export class UniformVec2 extends UniformVar<Vec2> {
  update(): void {
    this.program.gl.uniform2f(this.location, this.value.x, this.value.y)
  }
}
