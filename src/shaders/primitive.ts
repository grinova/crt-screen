import { ElementShader } from './element'

export class PrimitiveData {
  mode: GLenum
  elements: number[]
  readonly attributes: Map<string, number[]>

  constructor(mode: GLenum) {
    this.mode = mode
    this.elements = []
    this.attributes = new Map<string, number[]>()
  }
}

export interface Primitive {
  mode: GLenum
  offset: number
  count: number
}

export class PrimitiveShader extends ElementShader {
  private data: PrimitiveData[] = []
  private primitives: Primitive[] = []

  createPrimitive(mode: GLenum): PrimitiveData {
    const primitiveData = new PrimitiveData(mode)
    this.data.push(primitiveData)
    return primitiveData
  }

  bufferData(): void {
    for (const { mode, elements, attributes } of this.data) {
      attributes.forEach((data, name) => {
        const attrubute = this.getAttrubute(name)
        if (!attrubute) {
          return
        }
        attrubute.add(...data)
      })
      const offset = this.getElementsCount()
      for (const element of elements) {
        this.element(offset + element)
      }
      const count = elements.length
      this.primitives.push({ mode, offset, count })
    }
    super.bufferData()
  }

  flush(): void {
    if (this.primitives.length == 0) {
      return
    }
    for (const { mode, offset, count } of this.primitives) {
      this.mode = mode
      this.offset = offset
      this.count = count
      super.flush()
    }
  }

  shouldResetBuffers(): boolean {
    return false
  }
}
