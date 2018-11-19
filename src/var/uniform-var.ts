import { BaseVar } from './base-var'

export abstract class UniformVar<T = any> extends BaseVar<WebGLUniformLocation, T> {
  getLocation(name: string): WebGLUniformLocation {
    return this.program.gl.getUniformLocation(this.program.p, name)
  }
}
