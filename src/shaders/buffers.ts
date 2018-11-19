import { Shader } from './shader'
import { Camera } from '../camera'
import { Program } from '../program/program'
import { AttributeNumbers } from '../var/attribute-numbers'
import { UniformMat4 } from '../var/uniform-mat4'

const VS_SOURCE = `
attribute vec4 aVertex;
attribute vec4 aColor;

uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * aVertex;
  gl_PointSize = 5.0;
  vColor = aColor;
}`

const FS_SOURCE = `
varying lowp vec4 vColor;

void main(void) {
  gl_FragColor = vColor;
}`

export const DEFAULT_VARIABLES_OPTIONS = {
  'vertex': { name: 'aVertex', size: 2 },
  'color': { name: 'aColor', size: 4 },
  'projectionMatrix': { name: 'uProjectionMatrix' },
}

export interface VariableOptions {
  name: string
}

export interface UniformOptions extends VariableOptions {}

export interface AttributeOptions extends VariableOptions {
  size: number
}

export interface VariablesOptions {
  vertex?: void | AttributeOptions
  color?: void | AttributeOptions
  projectionMatrix?: void | VariableOptions
}

export class BuffersShader extends Shader {
  readonly camera: Camera
  readonly projectionMatrix: UniformMat4
  private attributes: Map<string, AttributeNumbers> = new Map<string, AttributeNumbers>()

  constructor(
    gl: WebGLRenderingContext,
    camera: Camera,
    verticesCount: number,
    program: Program = new Program(gl, VS_SOURCE, FS_SOURCE),
    variablesOptions: VariablesOptions = {}
  ) {
    super(program)
    this.camera = camera

    const vertexAttributeOptions = variablesOptions.vertex || DEFAULT_VARIABLES_OPTIONS.vertex
    const colorAttributeOptions = variablesOptions.color || DEFAULT_VARIABLES_OPTIONS.color
    const projectionMatrixVariableOptions = variablesOptions.projectionMatrix || DEFAULT_VARIABLES_OPTIONS.projectionMatrix
    const vertices = new AttributeNumbers(
      this.program,
      vertexAttributeOptions.name,
      vertexAttributeOptions.size,
      new Float32Array(verticesCount * vertexAttributeOptions.size)
    )
    const colors = new AttributeNumbers(
      this.program,
      colorAttributeOptions.name,
      colorAttributeOptions.size,
      new Float32Array(verticesCount * colorAttributeOptions.size)
    )
    this.projectionMatrix = new UniformMat4(
      this.program,
      projectionMatrixVariableOptions.name
    )
    this.attributes.set(vertexAttributeOptions.name, vertices)
    this.attributes.set(colorAttributeOptions.name, colors)
    this.addVars(vertices, colors, this.projectionMatrix)
  }

  getAttrubute(name: string): void | AttributeNumbers {
    return this.attributes.get(name)
  }

  flush(): void {
    super.flush()
    if (this.shouldResetBuffers()) {
      this.resetBuffers()
    }
  }

  resetBuffers(): void {
    for (const attribute of this.attributes.values()) {
      attribute.reset()
    }
  }

  shouldResetBuffers(): boolean {
    return true
  }

  bufferData(): void {
    for (const attribute of this.attributes.values()) {
      attribute.bufferData()
    }
  }

  protected beforeUpdateVariables(): void {
    super.beforeUpdateVariables && super.beforeUpdateVariables()
    this.bufferData()
    this.projectionMatrix.value = this.camera.buildProjectionMatrix()
  }
}
