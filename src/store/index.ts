import { Store } from 'pullstate'
import { IUIStore } from '../data/types'

export const UIStore = new Store<IUIStore>({
  classes: [],
  openClasses: [],
  openClass: null,
  controllerState: 'loading',
  cheerpjUrl: '',
  dirtyClasses: [],
  api: {},
  instances: [],
  inAction: false,
  page: 'home',
})
