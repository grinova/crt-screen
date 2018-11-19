import { UniformVar } from './uniform-var';

export class UniformInt extends UniformVar<number> {
  update(): void {
    this.program.gl.uniform1i(this.location, this.value)
  }
}
