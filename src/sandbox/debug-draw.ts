import {
  Color,
  Mat4,
  Vec2
} from 'classic2d'
import { Camera } from '../camera'
import { CrtScreen, Options as CrtScreenOptions } from '../crt-screen'
import { TextRender } from '../renderers/text'
import { DEFAULT_VARIABLES_OPTIONS } from '../shaders/buffers'

const enum ModelType {
  Point = 0,
  Circle = 1,
}

interface ModelsStore {
  [type: number]: {
    creator: (color: Color) => number
    indices: { [color: string]: number }
  }
}

export interface Options extends CrtScreenOptions {
  textSize?: number
}

export class DebugDraw extends CrtScreen {
  private static readonly CIRCLE_SEGMENT = 64

  isDebug: boolean = false

  private text: TextRender

  private modelsStore: ModelsStore

  constructor(
    gl: WebGLRenderingContext,
    gl2d: CanvasRenderingContext2D,
    camera: Camera,
    options: Options
  ) {
    super(gl, camera, options)
    const { textSize } = options

    this.modelsStore = {
      [ModelType.Point]: { creator: this.createColorPointModel, indices: {} },
      [ModelType.Circle]: { creator: this.createColorCircleModel, indices: {} },
    }

    this.text = new TextRender(gl2d, textSize)
  }

  drawCircle(position: Vec2, angle: number, radius: number, color: Color): void {
    const matrix = new Mat4().translate(position.x, position.y).rotate(angle).scale(radius, radius, 1)
    const modelIndex = this.getModelIndex(ModelType.Circle, color)
    this.drawModel(modelIndex, matrix)
  }

  drawPoint(position: Vec2, color: Color): void {
    const matrix = new Mat4().translate(position.x, position.y)
    const modelIndex = this.getModelIndex(ModelType.Point, color)
    this.drawModel(modelIndex, matrix)
  }

  drawText(text: string, x: number, y: number): void {
    this.text.fill(text, x, y)
  }

  flush(): void {
    super.flush()
    this.text.flush()
  }

  printText(text: string): void {
    this.text.print(text)
  }

  private createColorCircleModel = (color: Color): number => {
    const vertices: number[] = [0, 0]
    const colors: number[] = [...color]
    const elements: number[] = [0]
    const f = Math.PI / 2
    for (let i = 0; i <= DebugDraw.CIRCLE_SEGMENT; i++) {
      const fi = 2 * Math.PI / DebugDraw.CIRCLE_SEGMENT * i + f
      const x = Math.cos(fi)
      const y = Math.sin(fi)
      vertices.push(x, y)
      colors.push(...color)
      elements.push(i + 1)
    }
    return this.createColorPrimitive(this.gl.LINE_STRIP, vertices, colors, elements)
  }

  private createColorPointModel = (color: Color): number => {
    return this.createColorPrimitive(this.gl.POINTS, [0, 0], color, [0])
  }

  private createColorPrimitive(mode: GLenum, vertices: number[], colors: number[], elements: number[]): number {
    const modelShader = this.getModelShader()
    const model = modelShader.createModel()
    model.attributes.set(DEFAULT_VARIABLES_OPTIONS.vertex.name, vertices)
    model.attributes.set(DEFAULT_VARIABLES_OPTIONS.color.name, colors)
    model.primitives.push({ mode, elements })
    modelShader.bufferData()
    return model.index
  }

  private getModelIndex(type: ModelType, color: Color): number {
    const store = this.modelsStore[type]
    if (!store) {
      return -1
    }
    const hash = color.toString()
    let index = store.indices[hash]
    if (index == null) {
      index = store.creator(color)
      store.indices[hash] = index
    }
    return index
  }
}
