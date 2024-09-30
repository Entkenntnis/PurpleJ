import { Project } from '@/data/types'
import { UIStore } from '@/store/UIStore'

export function loadProject(p: Project, id?: string) {
  UIStore.update((s) => {
    s.dirtyClasses = p.classes.map((c) => c.name)
    s.openClass = null
    s.openClasses = []
    s.page = 'ide'
    s.projectId = id ?? Math.random().toString().substring(2)
    s.project = p
    s.editMeta = false
    s.showEditMetaTab = false
    s.showResourcesTab = false
    s.editResources = false
    s.showOutput = false
  })
}
