export interface Class {
  name: string
  content: string
  position: { x: number; y: number }
  size?: { width: number; height: number }
}

type Output = 'display' | 'terminal'

export interface IUIStore {
  projectId: string
  project: Project | null
  openClasses: string[]
  openClass: string | null
  dirtyClasses: string[]
  api: { [key: string]: ClassAPI }
  instances: { name: string; type: string }[]
  inAction: boolean
  page: 'home' | 'ide'
  cheerpjUrl: string
  controllerState: 'loading' | 'compile-if-dirty' | 'compiling' | 'running'
  showEditMetaTab: boolean
  editMeta: boolean
  showResourcesTab: boolean
  editResources: boolean
  showOutput: boolean
  syntheticMainCompiled: boolean
}

export interface Runtime {
  run: () => void
  compile: () => void
  getInteractiveElements(): InteractiveElement[]
  exit: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lib: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  heap: { [key: string]: any }
  displayElement: HTMLDivElement | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  standardLib: any
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
  summary: string
  description: string
  output: Output
  classes: Class[]
  files?: { name: string; content: string }[]
  lastUpdated: number
}
