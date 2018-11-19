import { Mat4 } from 'classic2d'
import { Buffer } from './buffer/buffer'
import { DoubleBuffer } from './buffer/double'
import { SingleBuffer } from './buffer/single'
import { Camera } from './camera'
import { Size } from './common/size'
import { FX } from './fx/fx'
import { FxConveyor } from './fx/fx-conveyor'
import { clear, ParameterizeTexture } from './helpers'
import { RenderingDirection } from './renderers/rendering-direction'
import { FadingShader } from './shaders/fading'
import { GlowingShader } from './shaders/glowing'
import { ModelShader } from './shaders/model'
import { PixelizationShader, PixelizationShaderOptions } from './shaders/pixelization'
import { ScreenShader } from './shaders/screen'

export interface Options extends Size {
  pixelizationShaderOptions: PixelizationShaderOptions
  size?: number
}

function getSize(width: number, height: number, size: number): Size {
  if (width >= height) {
    return { width: size, height: size * height / width }
  } else {
    return { width: size * width / height, height: size }
  }
}

export class CrtScreen {
  isDebug: boolean = false

  readonly gl: WebGLRenderingContext
  private parameterize: void | ParameterizeTexture

  private model: ModelShader

  private fading: FadingShader

  private frameBuffer: SingleBuffer

  private objects: { modelIndex: number, matrix: Mat4 }[] = []

  private conveyor: FxConveyor
  private buffers: Buffer[] = []

  constructor(
    gl: WebGLRenderingContext,
    camera: Camera,
    options: Options
  ) {
    this.initializeWebGL(gl)
    this.gl = gl
    const { width, height, pixelizationShaderOptions, size } = options

    this.model = new ModelShader(gl, camera)
    const { width: w, height: h } = getSize(width, height, size)
    this.frameBuffer = new SingleBuffer(gl, w, h, this.parameterize)
    this.buffers.push(this.frameBuffer)
    const { pxsize } = pixelizationShaderOptions
    this.fading = new FadingShader(gl)
    const fadingFeedbackBuffer = new DoubleBuffer(gl, w, h, this.parameterize)
    this.buffers.push(fadingFeedbackBuffer)
    this.fading.feedbackBuffer.value = fadingFeedbackBuffer

    this.conveyor = new FxConveyor(gl, this.frameBuffer, this.parameterize)
    // this.fading.on.value = 0
    const glowing = new GlowingShader(gl, 1 / Math.pow(2, 3))
    // glowing.on.value = 0
    const pixelization = new PixelizationShader(gl, pixelizationShaderOptions)
    // pixelization.on.value = 0
    const screen = new ScreenShader(gl)
    // screen.on.value = 0

    this.conveyor.addFx(new FX(glowing))
    this.conveyor.addFx(new FX(this.fading), fadingFeedbackBuffer)
    this.conveyor.addFx(new FX(pixelization, pxsize, pxsize))
    this.conveyor.addFx(new FX(screen))
    this.conveyor.updateProjectionMatrices()
  }

  initializeWebGL(gl: WebGLRenderingContext): void {
    {
      const ext =
        gl.getExtension('EXT_texture_filter_anisotropic') ||
        gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') ||
        gl.getExtension('MOZ_EXT_texture_filter_anisotropic')
      if (ext) {
        const max = gl.getParameter(ext.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
        this.parameterize = (gl: WebGLRenderingContext) => {
          gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, max);
        }
      }
    }
  }

  destroy(): void {
    for (const buffer of this.buffers) {
      buffer.destroy()
    }
    this.conveyor.destroy()
  }

  clear(): void {
    clear(this.gl)
  }

  drawModel(modelIndex: number, matrix: Mat4): void {
    this.objects.push({ modelIndex, matrix })
  }

  flush(): void {
    for (const object of this.objects) {
      this.model.object(object.modelIndex, object.matrix)
    }

    const direction = new RenderingDirection(this.gl, this.frameBuffer)
    direction.use()
    direction.clear()
    this.model.flush()

    this.conveyor.flush()

    this.objects = []
  }

  getModelShader(): ModelShader {
    return this.model
  }

  resize(width: number, height: number, size?: number): void {
    const { width: w, height: h } = getSize(width, height, size)
    this.frameBuffer.resize(w, h)
    this.conveyor.resize(w, h)
  }

  setFrameDuration(duration: number): void {
    this.fading.duration.value = duration
  }
}
