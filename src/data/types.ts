export interface Class {
  name: string
  content: string
  position: { x: number; y: number }
  size?: { width: number; height: number }
}

export interface Exercise {
  title: string
  description: string
  status: null | true | string
  className: string
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
  controllerState: 'loading' | 'compile-if-dirty' | 'compiling' | 'running'
  showEditMetaTab: boolean
  editMeta: boolean
  showResourcesTab: boolean
  editResources: boolean
  showOutput: boolean
  syntheticMainCompiled: boolean
  exercises: Exercise[]
}

export interface Runtime {
  run: () => void
  compile: () => void
  exit: () => void
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  lib: any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  heap: { [key: string]: { type: string; pointer: any } }
  displayElement: HTMLDivElement | null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  standardLib: any
}

export type FormalParameters = { name: string; type: string }[]

export interface ClassAPI {
  constructors: FormalParameters[]
  methods: {
    name: string
    returnType: string
    parameters: FormalParameters
  }[]
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
