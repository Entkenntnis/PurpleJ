import { Store } from 'pullstate'
import { IUIStore } from '../data/types'

export const UIStore = new Store<IUIStore>({
  projectId: -1,
  classes: [],
  openClasses: [],
  openClass: null,
  dirtyClasses: [],
  api: {},
  instances: [],
  inAction: false,
  page: 'home',
  output: 'terminal',
  controllerState: 'loading',
  cheerpjUrl: '',
})
