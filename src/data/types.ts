export interface IUIStore {
  classes: {
    name: string
    content: string
    position: { x: number; y: number }
    size?: { width: number; height: number }
  }[]
  openClasses: string[]
  openClass: string | null
  controllerState: 'loading' | 'compile-if-dirty' | 'compiling' | 'running'
  cheerpjUrl: string
  dirtyClasses: string[]
  api: { [key: string]: ClassAPI }
  instances: { name: string; type: string }[]
  inAction: boolean
}

export interface Runtime {
  exit: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lib: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  heap: { [key: string]: any }
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
