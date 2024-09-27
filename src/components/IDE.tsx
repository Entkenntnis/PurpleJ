import { ClassDiagram } from '@/components/ClassDiagram'
import { Editor } from '@/components/Editor'
import { Runner } from '@/components/Runner'
import { UIStore } from '@/store/UIStore'
import clsx from 'clsx'
import { useJavaRuntime } from './JavaRuntime'
import { ObjectBench } from './ObjectBench'
import {
  faBars,
  faCaretLeft,
  faCircle,
  faFloppyDisk,
} from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from './FaIcon'
import { useState } from 'react'

export default function IDE() {
  const openClasses = UIStore.useState((s) => s.openClasses)
  const openClass = UIStore.useState((s) => s.openClass)
  const dirtyClasses = UIStore.useState((s) => s.dirtyClasses)
  const output = UIStore.useState((s) => s.output)

  const runtime = useJavaRuntime()

  const [showMenu, setShowMenu] = useState(false)

  return (
    <>
      <div className="h-full flex flex-col">
        <div
          className={clsx(
            'absolute top-[44px] bottom-0 w-[300px] bg-white border-purple-300 border-r-2 border-t-2 rounded-tr-xl rounded-br-xl z-10 pl-3',
            'transition-all shadow-md',
            showMenu ? 'left-0' : '-left-[300px]',
          )}
        >
          <p>
            <button
              className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded my-3"
              onClick={() => {
                runtime.getRuntime().exit()
                UIStore.update((s) => {
                  s.page = 'home'
                })
              }}
            >
              <FaIcon icon={faCaretLeft} /> zurück
            </button>
          </p>
          <p>
            <button
              className="bg-gray-100 hover:bg-gray-200 px-2 py-0.5 rounded my-3"
              onClick={() => {
                alert('Dein Fortschritt wurde auf diesem Gerät gespeichert.')
              }}
            >
              <FaIcon icon={faFloppyDisk} /> Speichern
            </button>
          </p>
        </div>
        <div className="h-11 bg-gray-50 flex-grow-0 flex-shrink-0 flex justify-between items-baseline">
          <div className="flex items-baseline justify-start gap-4 pl-4">
            <button
              className="bg-gray-200 hover:bg-gray-300 px-2 py-0.5 rounded mr-5"
              onClick={() => {
                setShowMenu(!showMenu)
              }}
            >
              <FaIcon icon={faBars} /> Menü
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
                {name}
                {dirtyClasses.includes(name) && (
                  <FaIcon
                    icon={faCircle}
                    className="ml-1 text-[9px] text-black"
                  />
                )}
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
            <button
              className="px-2 py-0.5 bg-yellow-100 hover:bg-yellow-200 rounded ml-4"
              onClick={() => {
                const name = prompt('Welchen Namen soll die Klasse haben?')
                if (name) {
                  UIStore.update((s) => {
                    s.classes.push({
                      name,
                      content: `public class ${name} {
  public ${name} () {
      
  }
}`,
                      position: {
                        x: Math.random() * 300,
                        y: Math.random() * 300,
                      },
                    })
                  })
                }
              }}
            >
              + Neue Klasse
            </button>
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
          <div className="w-[calc(100%-500px)] h-full border-r-2 border-purple-300">
            <div className="flex flex-col h-full">
              <div className="h-[calc(100%-120px)]">
                {openClass == null ? <ClassDiagram /> : <Editor />}
              </div>
              <div className="h-[120px] border-t-2 border-purple-300">
                <ObjectBench />
              </div>
            </div>
          </div>
          <div className="w-[500px]">
            <Runner />
          </div>
        </div>
      </div>
    </>
  )
}
