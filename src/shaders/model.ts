import { Mat4 } from 'classic2d'
import { VariableOptions, VariablesOptions as BaseVariablesOptions } from './buffers'
import { ElementShader } from './element'
import { Primitive } from './primitive'
import { Camera } from '../camera'
import { Program } from '../program/program'
import { UniformMat4 } from '../var/uniform-mat4'

const VS_SOURCE = `
attribute vec4 aVertex;
attribute vec4 aColor;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying lowp vec4 vColor;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aVertex;
  gl_PointSize = 5.0;
  vColor = aColor;
}`

const FS_SOURCE = `
varying lowp vec4 vColor;

#define EDGE 1.5

void main(void) {
  gl_FragColor = min(vec4(1.0), vColor * vec4(EDGE));
}`

export interface ModelPrimitiveData {
  mode: GLenum
  elements: number[]
}

export class ModelData {
  readonly index: number
  readonly attributes: Map<string, number[]> = new Map<string, number[]>()
  readonly primitives: ModelPrimitiveData[] = []

  constructor(index: number) {
    this.index = index
  }
}

export interface Model {
  primitives: Primitive[]
}

const DEFAULT_MODEL_VIEW_MATRIX_OPTIONS = {
  name: 'uModelViewMatrix'
}

export interface VariablesOptions extends BaseVariablesOptions {
  modelViewMatrix?: void | VariableOptions
}

export class ModelShader extends ElementShader {
  private data: ModelData[] = []
  private models: Model[]
  private objects: { modelIndex: number, matrix: Mat4 }[] = []
  private modelViewMatrix: UniformMat4

  constructor(
    gl: WebGLRenderingContext,
    camera: Camera,
    indicesCount?: number,
    verticesCount?: number,
    program: Program = new Program(gl, VS_SOURCE, FS_SOURCE),
    variablesOptions: VariablesOptions = {}
  ) {
    super(gl, camera, indicesCount, verticesCount, program, variablesOptions)
    const modelViewMatrixOptions = variablesOptions.modelViewMatrix || DEFAULT_MODEL_VIEW_MATRIX_OPTIONS
    this.modelViewMatrix = new UniformMat4(this.program, modelViewMatrixOptions.name)
  }

  createModel(): ModelData {
    const data = new ModelData(this.data.length)
    this.data.push(data)
    return data
  }

  bufferData(): void {
    this.resetBuffers()
    let attributeOffset = 0
    for (const { attributes, primitives } of this.data) {
      let attributesCount = Infinity
      attributes.forEach((data: number[], name: string): void => {
        const attrubute = this.getAttrubute(name)
        if (!attrubute) {
          return
        }
        attrubute.add(...data)
        attributesCount = Math.min(attributesCount, data.length / attrubute.elementSize)
      })
      const ps = primitives.map(({ mode, elements }) => {
        const elementOffset = this.getElementsCount()
        for (const element of elements) {
          this.element(attributeOffset + element)
        }
        const count = elements.length
        return { mode, offset: elementOffset, count }
      })
      this.models.push({ primitives: ps })
      attributeOffset = attributeOffset + attributesCount
    }
    super.bufferData()
  }

  object(modelIndex: number, matrix: Mat4): void {
    this.objects.push({ modelIndex, matrix })
  }

  flush(): void {
    if (this.objects.length == 0) {
      return
    }
    const { gl } = this.program
    gl.useProgram(this.program.p)
    this.beforeUpdateVariables()
    this.onUpdateVariables()
    for (const { modelIndex, matrix } of this.objects) {
      const { primitives } = this.models[modelIndex]
      for (const { mode, offset, count } of primitives) {
        this.mode = mode
        this.offset = offset
        this.count = count
        this.modelViewMatrix.value = matrix
        this.modelViewMatrix.update()
        gl.drawElements(this.mode, this.count, gl.UNSIGNED_SHORT, this.offset * 2)
      }
    }
    this.objects = []
  }

  resetBuffers(): void {
    super.resetBuffers()
    this.models = []
  }

  shouldResetBuffers(): boolean {
    return false
  }

  protected beforeUpdateVariables(): void {
    this.projectionMatrix.value = this.camera.buildProjectionMatrix()
  }
}
