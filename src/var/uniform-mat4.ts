import { Mat4 } from 'classic2d'
import { UniformVar } from './uniform-var'

export class UniformMat4 extends UniformVar<Mat4> {
  update(): void {
    this.program.gl.uniformMatrix4fv(this.location, false, this.value)
  }
}
