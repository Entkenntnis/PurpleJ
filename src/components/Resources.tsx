import { UIStore } from '@/store/UIStore'
import clsx from 'clsx'
import { useState } from 'react'

export function Resources() {
  const files = UIStore.useState((s) => s.project!.files) ?? []
  const [selected, setSelected] = useState('')
  return (
    <div className="h-full flex">
      <div className="w-[200px] p-2 flex flex-col justify-between">
        <div>
          {files.length == 0 ? (
            <div>Keine Dateien</div>
          ) : (
            <div>
              {files.map((f) => (
                <div key={f.name} className="my-2">
                  <button
                    className={clsx(
                      'px-2 py-0.5 rounded text-left',
                      selected == f.name
                        ? 'bg-yellow-200'
                        : 'bg-gray-100 hover:bg-gray-200',
                    )}
                    onClick={() => {
                      setSelected(f.name)
                    }}
                  >
                    {f.name}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <button
            className="px-2 py-0.5 bg-green-200 hover:bg-green-300 rounded"
            onClick={() => {
              const name = prompt('Dateiname/Pfad eingeben')
              if (name) {
                UIStore.update((s) => {
                  if (!s.project!.files) {
                    s.project!.files = []
                  }
                  s.project!.files.push({ name, content: '' })
                })
              }
            }}
          >
            + Datei hinzufügen
          </button>
        </div>
      </div>
      <div className="h-full flex-grow p-3 bg-yellow-50 relative">
        {!selected ? (
          <p></p>
        ) : (
          <>
            <button
              className="absolute right-1 top-1 px-2 py-0.5 bg-gray-200 hover:bg-red-300 rounded"
              onClick={() => {
                const result = confirm('Datei wirklich löschen?')
                if (result) {
                  UIStore.update((s) => {
                    s.project!.files = files.filter((f) => {
                      return f.name !== selected
                    })
                  })
                  setSelected('')
                }
              }}
            >
              Datei löschen
            </button>
            <textarea
              className="w-full h-full p-1 resize-none"
              value={files.find((f) => f.name == selected)?.content}
              onChange={(e) => {
                const newContent = e.target.value
                UIStore.update((s) => {
                  s.project!.files = files.map((f) => {
                    if (f.name == selected) {
                      return { name: f.name, content: newContent }
                    }
                    return f
                  })
                })
              }}
            ></textarea>
          </>
        )}
      </div>
    </div>
  )
}
