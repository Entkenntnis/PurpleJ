import { Store } from 'pullstate'

interface IUIStore {
  files: { name: string; content: string; id: number }[]
  filesIdCounter: number
}

export const UIStore = new Store<IUIStore>({
  files: [{ name: 'Test', content: 'Hello', id: 1 }],
  filesIdCounter: 2,
})
