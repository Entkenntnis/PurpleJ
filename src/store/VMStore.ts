import { Store } from 'pullstate'
import { IVMStore } from '../data/types'

export const VMStore = new Store<IVMStore>({
  controllerState: 'loading',
  cheerpjUrl: '',
})
