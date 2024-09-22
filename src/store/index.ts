import { Store } from 'pullstate'
import { IUIStore } from '../data/types'
import { figuresExample } from '../data/figures-example'

export const UIStore = new Store<IUIStore>({
  classes: figuresExample,
  openClasses: [],
  openClass: null,
  controllerState: 'loading',
  cheerpjUrl: '',
  dirtyClasses: [],
  mainScript: `Triangle t = new Triangle();
System.out.println("Hallo");
t.makeVisible();`,
  mainScriptDirty: true,
})
