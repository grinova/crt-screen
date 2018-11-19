import { BaseVar } from './base-var'

export abstract class AttributeVar<T = any> extends BaseVar<GLint, T> {
  getLocation(name: string): GLint {
    return this.program.gl.getAttribLocation(this.program.p, name)
  }
}
