import { UIStore } from '@/store/UIStore'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { useJavaRuntime } from './JavaRuntime'
import Markdown from 'react-markdown'
import { FaIcon } from './FaIcon'
import { faPencil } from '@fortawesome/free-solid-svg-icons'

export function Runner() {
  const displayRef = useRef<HTMLDivElement>(null)
  const output = UIStore.useState((s) => s.project!.output)
  const project = UIStore.useState((s) => s.project)

  const runtime = useJavaRuntime()

  useEffect(() => {
    runtime.getRuntime().displayElement = displayRef.current
  }, [runtime])

  const [tab, setTab] = useState(0)

  if (!project) {
    return <>bad</>
  }

  return (
    <>
      <div className="h-full flex flex-col">
        <div className="relative h-[360px] absolute">
          <div
            className={clsx(
              'absolute inset-0',
              output !== 'display' ? 'opacity-0' : 'z-10',
            )}
            ref={displayRef}
          >
            <div className="h-full flex items-center justify-center text-4xl text-gray-300">
              leere Ausgabe
            </div>
          </div>
          <div
            className={clsx(
              'absolute inset-0 bg-teal-50 overflow-auto',
              output !== 'terminal' ? 'opacity-0' : 'z-10',
            )}
          >
            <pre
              className="font-mono text-sm h-full px-1 text-wrap"
              id="console"
            />
          </div>
        </div>
        <div className="h-[calc(100%-360px)] flex flex-col border-t-2 border-purple-300">
          <div className="border-b border-gray-200">
            <button
              className={clsx(
                'border-r-2 border-r-gray-200 px-4 py-1',
                tab == 0 ? 'bg-pink-200' : 'hover:bg-pink-100',
              )}
              onClick={() => {
                setTab(0)
              }}
            >
              Beschreibung
            </button>
            <button
              className={clsx(
                'border-r-2 border-r-gray-200 px-4 py-1',
                tab == 1 ? 'bg-pink-200' : 'hover:bg-pink-100',
              )}
              onClick={() => {
                setTab(1)
              }}
            >
              Erkunden (0/3)
            </button>
            <button
              className={clsx(
                'px-4 border-r-2 border-r-gray-200 py-1',
                tab == 2 ? 'bg-pink-200' : 'hover:bg-pink-100',
              )}
              onClick={() => {
                setTab(2)
              }}
            >
              Challenges (0/4)
            </button>
          </div>
          <div className="overflow-auto p-2 relative">
            <div className="absolute right-3 top-3">
              <button
                className="bg-gray-100 hover:bg-gray-200 w-9 h-9 rounded"
                onClick={() => {
                  UIStore.update((s) => {
                    s.showEditMetaTab = true
                    s.editMeta = true
                  })
                }}
              >
                <FaIcon icon={faPencil} />
              </button>
            </div>
            {tab == 0 && (
              <div className="prose mt-3 prose-p:text-gray-900 prose-li:text-gray-900">
                <h2 className="mr-10">{project.title}</h2>
                <Markdown>{project!.description}</Markdown>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
