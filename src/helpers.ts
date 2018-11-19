import { Mat4 } from 'classic2d'

export function initShaderProgram(gl: WebGLRenderingContext, vsSource: string, fsSource: string): WebGLProgram {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource)
  const shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)
  gl.detachShader(shaderProgram, vertexShader)
  gl.detachShader(shaderProgram, fragmentShader)
  gl.deleteShader(vertexShader)
  gl.deleteShader(fragmentShader)
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram))
    return null
  }
  return shaderProgram
}

export function loadShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export type ParameterizeTexture = (gl: WebGLRenderingContext) => void

export function createTexture(
  gl: WebGLRenderingContext,
  width: number,
  height: number,
  parameterize?: void | ParameterizeTexture
): WebGLTexture {
  const texture = gl.createTexture()
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  parameterize && parameterize(gl)
  gl.bindTexture(gl.TEXTURE_2D, null)
  return texture
}

export function resizeTexture(gl: WebGLRenderingContext, texture: WebGLTexture, width: number, height: number): void {
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.bindTexture(gl.TEXTURE_2D, null)
}

export function clear(gl: WebGLRenderingContext): void {
  gl.clearColor(0.0, 0.0, 0.0, 0.0)
  gl.clearDepth(1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
}

export function createTextureShaderProjectionMatrix(width: number, height: number): Mat4 {
  return Mat4.ortho(0, width, height, 0, -1, 1).scale(width, height, 1)
}
