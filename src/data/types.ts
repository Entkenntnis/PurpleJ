export interface IUIStore {
  classes: {
    name: string
    content: string
    position: { x: number; y: number }
    size?: { width: number; height: number }
  }[]
  openClasses: string[]
  openClass: string | null
  dirtyClasses: string[]
  api: { [key: string]: ClassAPI }
  instances: { name: string; type: string }[]
  inAction: boolean
  page: 'home' | 'ide'
  output: 'display' | 'terminal'
}

export interface Runtime {
  compileAndRun: () => void
  getInteractiveElements(): InteractiveElement[]
  exit: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lib: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  heap: { [key: string]: any }
  displayElement: HTMLDivElement | null
}

export interface ClassAPI {
  hasPublicConstructor: boolean
  publicConstructorParams: { name: string; type: string }[]
  publicMethods: {
    name: string
    returnType: string
    parameters: { name: string; type: string }[]
  }[]
}

export interface IVMStore {
  cheerpjUrl: string
  controllerState: 'loading' | 'compile-if-dirty' | 'compiling' | 'running'
}

export interface InteractiveElement {
  code: string
  action: () => void
}
