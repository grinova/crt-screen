import { createSandbox } from './sandbox'

window.onload = () => {
  const width = window.innerWidth
  const height = window.innerHeight
  const { sandbox } = createSandbox({ width, height })
  const resize = (): void => {
    sandbox.resize(window.innerWidth, window.innerHeight)
  }
  const keyDown = (event: KeyboardEvent): void => {
    sandbox.keyDown(event)
  }
  window.addEventListener('resize', resize)
  window.addEventListener('keydown', keyDown)
  sandbox.run()
}
