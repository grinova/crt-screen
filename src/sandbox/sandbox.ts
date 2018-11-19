import { Mat4, Vec2 } from 'classic2d'
import { DebugDraw } from './debug-draw'
import { MovingAverage } from './moving-average'
import { Camera } from '../camera'
import { appendDomElement, setCanvasSize } from '../common/dom'
import { Size } from '../common/size'
import { DEFAULT_VARIABLES_OPTIONS } from '../shaders/buffers'

const PXSIZE = 3
const MIN_EDGE = 1
const MAX_EDGE = 2

function roundSize(width: number, height: number): [number, number] {
  return [
    Math.floor(width / PXSIZE) * PXSIZE,
    Math.floor(height / PXSIZE) * PXSIZE,
  ]
}

export function createSandbox(options: SandboxOptionsBase, parent: HTMLElement = document.body) {
  const { element: canvasWebgl, remove: removeCanvasWebgl } = appendDomElement('canvas', parent)
  const { element: canvas2d, remove: removeCanvas2d } = appendDomElement('canvas', parent)
  parent.style.overflow = 'hidden'
  parent.style.margin = '0px'
  canvasWebgl.style.position = 'absolute'
  canvas2d.style.position = 'absolute'

  const sandbox = new Sandbox({ ...options, canvasWebgl, canvas2d })
  const remove = () => {
    sandbox.stop()
    removeCanvasWebgl()
    removeCanvas2d()
  }
  return { sandbox, remove }
}

export interface SandboxOptionsBase extends Size {
}

export interface SandboxOptions extends SandboxOptionsBase {
  canvasWebgl: HTMLCanvasElement
  canvas2d: HTMLCanvasElement
}

export class Sandbox {
  private canvasWebgl: HTMLCanvasElement
  private canvas2d: HTMLCanvasElement
  private camera: Camera
  private debugDraw: DebugDraw

  private past = 0
  private running = false
  private isPause = false
  private isFreeze = false
  private frameTimeMovingAverage = new MovingAverage(60)

  private crossModelIndex: number
  private triangleModelIndex: number
  private squareModelIndex: number
  private gridModelIndex: number

  private circleModelMatrix = new Mat4()
  private crossModelMatrix = new Mat4().translate(0, -1.5)
  private triangleModelMatrix = new Mat4()

  constructor(options: SandboxOptions) {
    const { canvasWebgl, canvas2d, width: w, height: h } = options
    this.canvasWebgl = canvasWebgl
    this.canvas2d = canvas2d

    const [width, height] = roundSize(w, h)

    setCanvasSize(this.canvasWebgl, width, height)
    setCanvasSize(this.canvas2d, width, height)

    this.camera = new Camera(0, 0, 0, width, height)

    const gl = <WebGLRenderingContext>this.canvasWebgl.getContext('webgl2') || this.canvasWebgl.getContext('experimental-webgl')
    const gl2d = this.canvas2d.getContext('2d')

    const size = this.calcSize(width, height)
    const pixelizationShaderOptions = { pxsize: PXSIZE, minEdge: MIN_EDGE, maxEdge: MAX_EDGE }
    this.debugDraw = new DebugDraw(gl, gl2d, this.camera, { width, height, pixelizationShaderOptions, size })

    const modelShader = this.debugDraw.getModelShader()
    {
      const model = modelShader.createModel()
      model.attributes.set(DEFAULT_VARIABLES_OPTIONS.vertex.name, [-1,-1,  1,1,  -1,1,  1,-1])
      model.attributes.set(DEFAULT_VARIABLES_OPTIONS.color.name, [0,1,0,1,  1,0,0,1,  1,1,0,1,  0,1,1,1])
      model.primitives.push({ mode: gl.POINTS, elements: [0, 1, 2, 3] })
      model.primitives.push({ mode: gl.LINES, elements: [0, 1, 2, 3] })
      this.crossModelIndex = model.index
    }
    {
      const model = modelShader.createModel()
      model.attributes.set(DEFAULT_VARIABLES_OPTIONS.vertex.name, [0,0,  2,0,  0,2])
      model.attributes.set(DEFAULT_VARIABLES_OPTIONS.color.name, [1,0,0,1,  0,1,0,1,  0,0,1,1])
      model.primitives.push({ mode: gl.TRIANGLES, elements: [0, 1, 2] })
      this.triangleModelIndex = model.index
    }
    {
      const x = 3
      const y = 4
      const model = modelShader.createModel()
      model.attributes.set(DEFAULT_VARIABLES_OPTIONS.vertex.name, [-x,-y,  -x,y,  x,y,  x,-y])
      model.attributes.set(DEFAULT_VARIABLES_OPTIONS.color.name, [1,1,1,1,  1,1,1,1,  1,1,1,1,  1,1,1,1])
      model.primitives.push({ mode: gl.TRIANGLES, elements: [1, 0, 3, 1, 3, 2]})
      this.squareModelIndex = model.index
    }
    {
      const model = modelShader.createModel()
      const vertices = []
      const colors: number[] = []
      const elements: number[] = []
      const xEdge = 9
      const yEdge = 5
      const yStep = 1
      const xStep = 1
      let n = 0
      for (let x = -xEdge; x <= xEdge; x += xStep) {
        vertices.push(x, -yEdge, x, yEdge)
        colors.push(1,1,1,1,  1,1,1,1)
        elements.push(n, n + 1)
        n += 2
      }
      for (let y = -yEdge; y <= yEdge; y += yStep) {
        vertices.push(-xEdge, y, xEdge, y)
        colors.push(1,1,1,1,  1,1,1,1)
        elements.push(n, n + 1)
        n += 2
      }
      model.attributes.set(DEFAULT_VARIABLES_OPTIONS.vertex.name, vertices)
      model.attributes.set(DEFAULT_VARIABLES_OPTIONS.color.name, colors)
      model.primitives.push({ mode: gl.LINES, elements })
      this.gridModelIndex = model.index
    }
    modelShader.bufferData()
  }

  keyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'r':
        this.reset()
        break
      case 'p':
        this.pause()
        break
      case 'o':
        this.step()
        break
      case 'f':
        this.freeze()
        break
      case 'd':
        this.debug()
        break
    }
  }

  resize(w: number, h: number): void {
    const [width, height] = roundSize(w, h)

    this.camera.width = width
    this.camera.height = height

    setCanvasSize(this.canvasWebgl, width, height)
    setCanvasSize(this.canvas2d, width, height)

    const size = this.calcSize(width, height)
    this.debugDraw.resize(width, height, size)
  }

  zoom(zoom: number): void {
    this.camera.zoom = zoom
  }

  run(): void {
    this.running = true
    requestAnimationFrame(this.render)
  }

  stop(): void {
    this.running = false
  }

  private debug(): void {
    this.debugDraw.isDebug = !this.debugDraw.isDebug
  }

  private freeze(): void {
    this.isFreeze = !this.isFreeze
  }

  private pause(): void {
    this.isPause = !this.isPause
  }

  private reset(): void {
  }

  private step(): void {
  }

  private action(time: number): void {
    if (!this.isPause) {
      this.circleModelMatrix.rotate(time / 500 * Math.PI / 4)
      this.crossModelMatrix.rotate(-time / 2000 * Math.PI / 4)
      this.triangleModelMatrix.rotate(time / 1000 * Math.PI / 4)
    }
  }

  private calcSize(width: number, height: number): number {
    return width >= height ? width / PXSIZE : height / PXSIZE
  }

  private draw(time: number): void {
    this.drawHelp(time)
    this.debugDraw.setFrameDuration(time / 1000)
    this.debugDraw.drawModel(this.squareModelIndex, new Mat4())
    this.debugDraw.drawModel(this.gridModelIndex, new Mat4())
    this.debugDraw.drawCircle(new Vec2(0, 0), 0, 3, [1, 1, 1, 1])
    this.debugDraw.drawPoint(new Vec2(2, 2), [1, 1, 1, 1])
    this.debugDraw.drawModel(this.crossModelIndex, this.crossModelMatrix)
    this.debugDraw.drawModel(this.triangleModelIndex, this.triangleModelMatrix)
    this.debugDraw.flush()
  }

  private render = (now: number): void => {
    if (!this.running) {
      return
    }
    const time = now - this.past
    this.past = now
    if (!this.isFreeze) {
      this.action(time)
      this.draw(time)
    }
    requestAnimationFrame(this.render)
  }

  private drawHelp(time: number): void {
    const averageFrameTime = this.frameTimeMovingAverage.get(time)
    const help = '[R] - reset [P] - pause [O] - step [F] - freeze [D] - debug draw'
    const fps = 'FPS: ' + Math.floor(1000 / averageFrameTime).toString()
    const frame = 'Frame time: ' + averageFrameTime.toFixed(3).toString() + ' ms'
    this.debugDraw.printText(help)
    this.debugDraw.printText(fps)
    this.debugDraw.printText(frame)
    if (this.isPause) {
      this.debugDraw.printText('[PAUSE]')
    }
    if (this.isFreeze) {
      this.debugDraw.printText('[FREEZE]')
    }
    if (this.debugDraw.isDebug) {
      this.debugDraw.printText('[DEBUG DRAW]')
    }
  }
}
