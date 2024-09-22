export interface IUIStore {
  classes: { name: string; content: string }[]
  openClasses: string[]
  openClass: string | null
  controllerState: 'loading' | 'compile-or-run' | 'compiling'
  cheerpjUrl: string
  dirtyClasses: string[]
  mainScript: string
  mainScriptDirty: boolean
}
