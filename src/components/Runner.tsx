import { UIStore } from '@/store/UIStore'
import clsx from 'clsx'
import { useEffect, useRef } from 'react'
import { useJavaRuntime } from './JavaRuntime'

export function Runner() {
  const displayRef = useRef<HTMLDivElement>(null)
  const output = UIStore.useState((s) => s.output)

  const runtime = useJavaRuntime()

  useEffect(() => {
    runtime.getRuntime().displayElement = displayRef.current
  }, [runtime])

  return (
    <>
      <div className="h-full flex flex-col">
        <div
          className={clsx('h-[360px]', output !== 'display' && 'hidden')}
          ref={displayRef}
        ></div>
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
        <div className="h-[calc(100%-360px)] overflow-auto border-t-2 border-purple-300">
          <h1>In diesem Bereich findet sich die Aufgabenstellung.</h1>
          <p>Hier wird erklärt, wie das Projekt funktioniert.</p>
        </div>
      </div>
    </>
  )
}
