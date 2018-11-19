const WHITE = '#FFFFFF'

export class TextRender {
  private static readonly DEFAULT_SIZE = 12
  private static readonly DEFAULT_FONT = 'Courier New'

  private gl2d: CanvasRenderingContext2D
  private size: number
  private yOffset: number = 0

  private texts: {
    text: string
    x: number
    y: number
  }[] = []

  constructor(gl2d: CanvasRenderingContext2D, size: number = TextRender.DEFAULT_SIZE) {
    this.gl2d = gl2d
    this.size = size
  }

  fill(text: string, x: number, y: number): void {
    this.texts.push({ text, x, y })
  }

  print(text: string): void {
    this.fill(text, 0, this.yOffset)
    this.yOffset += this.size
  }

  flush(): void {
    const { gl2d } = this
    gl2d.clearRect(0, 0, gl2d.canvas.width, gl2d.canvas.height)
    gl2d.fillStyle = WHITE
    gl2d.font = this.size + 'px ' + TextRender.DEFAULT_FONT
    gl2d.textBaseline = 'top'

    for (const text of this.texts) {
      this.gl2d.fillText(text.text, text.x, text.y)
    }
    this.texts = []
    this.yOffset = 0
  }
}
