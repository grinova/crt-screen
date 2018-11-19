import { Program } from '../program/program'
import { Var } from '../var/var'

export class Shader {
  readonly program: Program

  private variables: Var[]

  constructor(
    program: Program,
    ...variables: Var[]
  ) {
    this.program = program
    this.variables = variables
  }

  addVars(...v: Var[]): void {
    this.variables.push(...v)
  }

  flush(): void {
    const { gl } = this.program
    gl.useProgram(this.program.p)
    this.beforeUpdateVariables && this.beforeUpdateVariables()
    this.onUpdateVariables()
  }

  protected beforeUpdateVariables?(): void

  protected onUpdateVariables(): void {
    for (const variable of this.variables) {
      variable.update()
    }
  }
}
