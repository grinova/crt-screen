import { Var } from './var'
import { Program } from '../program/program'

export abstract class BaseVar<L, T = any> implements Var {
  value: T
  readonly location: L
  readonly program: Program

  constructor(program: Program, name: string, value?: void | T) {
    this.program = program
    this.location = this.getLocation(name)
    if (value) {
      this.value = value
    }
  }

  abstract getLocation(name: string): L
  abstract update(): void
}
