import { ClassDiagram } from '@/components/ClassDiagram'
import { Editor } from '@/components/Editor'
import { Runner } from '@/components/Runner'
import { UIStore } from '@/store'
import clsx from 'clsx'
import { ArrowLeft } from 'lucide-react'

export default function IDE() {
  const openClasses = UIStore.useState((s) => s.openClasses)
  const openClass = UIStore.useState((s) => s.openClass)

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="h-12 bg-gray-50 flex-grow-0 flex-shrink-0 flex items-center justify-start gap-4 pl-4">
          <button
            className="bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded"
            onClick={() => {
              // currently, I can't really handle runtime reuse properly
              window.location.reload()
            }}
          >
            <ArrowLeft className="inline-block w-5" /> zurück
          </button>
          <button
            className="px-2 py-0.5 bg-lime-200 rounded hover:bg-lime-300"
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
                  ? 'bg-pink-200'
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
        <div className="flex-grow flex">
          <div className="flex-1 border-2 border-lime-300 w-1/2">
            {openClass == null ? <ClassDiagram /> : <Editor />}
          </div>
          <div className="bg-llime-300 flex-1 w-1/2">
            <Runner />
          </div>
        </div>
      </div>
    </>
  )
}
