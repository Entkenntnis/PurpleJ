import { Store } from 'pullstate'
import { IUIStore } from '../data/types'
import { figuresExample } from '@/content/figures-example'

export const UIStore = new Store<IUIStore>({
  classes: figuresExample,
  openClasses: [],
  openClass: null,
  controllerState: 'loading',
  cheerpjUrl: '',
  dirtyClasses: figuresExample.map((c) => c.name),
  api: {},
  instances: [],
  inAction: false,
})
