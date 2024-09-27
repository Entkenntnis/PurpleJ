import { UIStore } from '@/store/UIStore'

export function saveProject() {
  UIStore.update((s) => {
    s.project!.lastUpdated = new Date().getTime()
  })
  const ui = UIStore.getRawState()
  localStorage.setItem(
    `purplej_project_${ui.projectId}`,
    JSON.stringify(ui.project),
  )
}
