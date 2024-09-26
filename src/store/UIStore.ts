import { Store } from 'pullstate'
import { IUIStore } from '../data/types'

export const UIStore = new Store<IUIStore>({
  classes: [],
  openClasses: [],
  openClass: null,
  dirtyClasses: [],
  api: {},
  instances: [],
  inAction: false,
  page: 'home',
  output: 'terminal',
})
