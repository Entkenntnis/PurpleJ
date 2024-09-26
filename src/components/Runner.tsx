import { UIStore } from '@/store/UIStore'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { useJavaRuntime } from './JavaRuntime'
import { projects } from '@/content/projects'

export function Runner() {
  const displayRef = useRef<HTMLDivElement>(null)
  const output = UIStore.useState((s) => s.output)
  const projectId = UIStore.useState((s) => s.projectId)
  const project = projects[projectId]

  const runtime = useJavaRuntime()

  useEffect(() => {
    runtime.getRuntime().displayElement = displayRef.current
  }, [runtime])

  const [tab, setTab] = useState(0)

  return (
    <>
      <div className="h-full flex flex-col">
        <div
          className={clsx('h-[360px]', output !== 'display' && 'hidden')}
          ref={displayRef}
        >
          <div className="h-full flex items-center justify-center text-4xl text-gray-300">
            leere Ausgabe
          </div>
        </div>
        <div
          className={clsx(
            'h-[360px] bg-teal-50 overflow-auto',
            output !== 'terminal' && 'hidden',
          )}
        >
          <pre
            className="font-mono text-sm h-full px-1 text-wrap"
            id="console"
          />
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
          <div className="overflow-auto p-2">
            {tab == 0 && (
              <div className="prose mt-3">
                <h2>{project.title}</h2>
                {project.description}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
