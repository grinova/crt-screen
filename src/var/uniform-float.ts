import { UniformVar } from './uniform-var'

export class UniformFloat extends UniformVar<number> {
  update(): void {
    this.program.gl.uniform1f(this.location, this.value)
  }
}
