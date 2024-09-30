import { Store } from 'pullstate'
import { IUIStore } from '../data/types'

export const UIStore = new Store<IUIStore>({
  openClasses: [],
  openClass: null,
  dirtyClasses: [],
  api: {},
  instances: [],
  inAction: false,
  page: 'home',
  controllerState: 'loading',
  cheerpjUrl: '',
  project: null,
  projectId: '',
  showEditMetaTab: false,
  editMeta: false,
  showResourcesTab: false,
  editResources: false,
  showOutput: false,
  syntheticMainCompiled: false,
})
