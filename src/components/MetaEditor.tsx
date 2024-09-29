import { UIStore } from '@/store/UIStore'

export function MetaEditor() {
  const title = UIStore.useState((s) => s.project!.title)
  const summary = UIStore.useState((s) => s.project!.summary)
  const description = UIStore.useState((s) => s.project!.description)
  return (
    <div className="h-full mx-3 py-6 flex flex-col">
      <div className="flex items-baseline">
        <div className="w-[200px]">Titel:</div>
        <input
          className="border p-1 flex-grow"
          value={title}
          onChange={(e) => {
            UIStore.update((s) => {
              s.project!.title = e.target.value
            })
          }}
        />
      </div>
      <div className="flex items-baseline mt-3">
        <div className="w-[200px]">Zusammenfassung:</div>
        <input
          className="border p-1 flex-grow"
          value={summary}
          onChange={(e) => {
            UIStore.update((s) => {
              s.project!.summary = e.target.value
            })
          }}
        />
      </div>
      <div className="flex items-baseline mt-3 flex-grow">
        <div className="w-[200px]">Beschreibung:</div>
        <textarea
          className="border p-1 flex-grow h-full resize-none"
          value={description}
          onChange={(e) => {
            UIStore.update((s) => {
              s.project!.description = e.target.value
            })
          }}
        />
      </div>
      <div className="text-right text-sm mt-1 text-gray-600">
        Markdown verfügbar
      </div>
    </div>
  )
}
