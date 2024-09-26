export interface Class {
  name: string
  content: string
  position: { x: number; y: number }
  size?: { width: number; height: number }
}

type Output = 'display' | 'terminal'

export interface IUIStore {
  projectId: number
  classes: Class[]
  openClasses: string[]
  openClass: string | null
  dirtyClasses: string[]
  api: { [key: string]: ClassAPI }
  instances: { name: string; type: string }[]
  inAction: boolean
  page: 'home' | 'ide'
  output: Output
  cheerpjUrl: string
  controllerState: 'loading' | 'compile-if-dirty' | 'compiling' | 'running'
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

export interface InteractiveElement {
  code: string
  action: () => void
}

export interface Project {
  title: string
  description: JSX.Element
  output: Output
  classes: Class[]
  files?: { name: string; content: string }[]
}
