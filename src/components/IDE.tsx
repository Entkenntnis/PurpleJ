import { ClassDiagram } from '@/components/ClassDiagram'
import { Editor } from '@/components/Editor'
import { Runner } from '@/components/Runner'
import { UIStore } from '@/store'
import clsx from 'clsx'
import { ArrowLeft } from 'lucide-react'

export default function IDE() {
  const openClasses = UIStore.useState((s) => s.openClasses)
  const openClass = UIStore.useState((s) => s.openClass)
  const output = UIStore.useState((s) => s.output)

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="h-11 bg-gray-50 flex-grow-0 flex-shrink-0 flex justify-between items-baseline">
          <div className="flex items-baseline justify-start gap-4 pl-4">
            <button
              className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded"
              onClick={() => {
                // currently, I can't really handle runtime reuse properly
                window.location.reload()
              }}
            >
              <ArrowLeft className="inline-block w-3" /> zurück
            </button>
            <button
              className={clsx(
                'px-2 py-0.5 rounded',
                openClass === null
                  ? 'mt-2 pb-2.5 rounded-bl-none rounded-br-none bg-purple-400 '
                  : 'bg-purple-200 hover:bg-purple-300',
              )}
              onClick={() => {
                UIStore.update((s) => {
                  s.openClass = null
                })
              }}
            >
              Klassenübersicht
            </button>
            {openClasses.map((name) => (
              <div
                key={name}
                className={clsx(
                  'px-2 py-0.5 rounded cursor-pointer flex items-baseline',
                  openClass === name
                    ? 'bg-pink-200 mt-2 pb-2.5 rounded-bl-none rounded-br-none'
                    : 'bg-gray-200 hover:bg-gray-300',
                )}
                onClick={() => {
                  UIStore.update((s) => {
                    if (s.openClasses.includes(name)) {
                      s.openClass = name
                    }
                  })
                }}
              >
                {name}{' '}
                <button
                  className="inline-block flex items-center justify-center p-0.5 pb-1 h-4 rounded bg-white ml-3 hover:bg-red-500"
                  onClick={(e) => {
                    UIStore.update((s) => {
                      s.openClasses = s.openClasses.filter((el) => el !== name)
                      s.openClass = null
                    })
                    e.preventDefault()
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="pr-4">
            Ausgabe:{' '}
            <select
              className="p-1"
              value={output}
              onChange={(e) => {
                UIStore.update((s) => {
                  s.output = e.target.value as 'terminal' | 'display'
                })
              }}
            >
              <option value="display">Bildschirm</option>
              <option value="terminal">Terminal</option>
            </select>
          </div>
        </div>
        <div className="h-[calc(100%-44px)] flex">
          <div className="w-[calc(100%-500px)] h-full">
            {openClass == null ? <ClassDiagram /> : <Editor />}
          </div>
          <div className="w-[500px]">
            <Runner />
          </div>
        </div>
      </div>
    </>
  )
}
