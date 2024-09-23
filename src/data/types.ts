export interface IUIStore {
  classes: {
    name: string
    content: string
    position: { x: number; y: number }
    size?: { width: number; height: number }
  }[]
  openClasses: string[]
  openClass: string | null
  controllerState: 'loading' | 'compile-or-run' | 'compiling'
  cheerpjUrl: string
  dirtyClasses: string[]
  mainScript: string
  mainScriptDirty: boolean
}
