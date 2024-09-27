import { ClassDiagram } from '@/components/ClassDiagram'
import { Editor } from '@/components/Editor'
import { Runner } from '@/components/Runner'
import { UIStore } from '@/store/UIStore'
import clsx from 'clsx'
import { useJavaRuntime } from './JavaRuntime'
import { ObjectBench } from './ObjectBench'
import {
  faBars,
  faCircle,
  faDownload,
  faFloppyDisk,
  faTrashCan,
} from '@fortawesome/free-solid-svg-icons'
import { FaIcon } from './FaIcon'
import { useState } from 'react'
import { saveProject } from '@/actions/save-project'

export default function IDE() {
  const openClasses = UIStore.useState((s) => s.openClasses)
  const openClass = UIStore.useState((s) => s.openClass)
  const dirtyClasses = UIStore.useState((s) => s.dirtyClasses)
  const output = UIStore.useState((s) => s.project!.output)

  const runtime = useJavaRuntime()

  const [showMenu, setShowMenu] = useState(false)

  return (
    <>
      <div className="h-full flex flex-col">
        <div
          className={clsx(
            'absolute top-[42px] bottom-0 w-[300px] bg-white border-purple-300 border-r-2 border-t-2 rounded-tr-xl rounded-br-xl z-10 pl-3',
            'transition-all shadow-md flex justify-between flex-col',
            showMenu ? 'left-0' : '-left-[300px]',
          )}
        >
          <div>
            <p className="mt-4">
              <button
                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded my-3"
                onClick={() => {
                  runtime.getRuntime().exit()
                  saveProject()
                  UIStore.update((s) => {
                    s.page = 'home'
                  })
                }}
              >
                <FaIcon icon={faFloppyDisk} className="mr-2" /> Projekt
                speichern und schließen
              </button>
            </p>

            <p className="mt-3">
              <button
                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded my-3"
                onClick={() => {
                  runtime.getRuntime().exit()
                  saveProject()

                  const p = UIStore.getRawState().project!
                  const blob = new Blob([JSON.stringify(p)], {
                    type: 'text/json',
                  })
                  const link = document.createElement('a')

                  link.download = `${new Date().toISOString().substring(0, 10)}-${p?.title.replace(
                    /[^A-Za-z0-9äüöÄÜÖß]/g,
                    '_',
                  )}-purplej.json`
                  link.href = window.URL.createObjectURL(blob)
                  link.dataset.downloadurl = [
                    'text/json',
                    link.download,
                    link.href,
                  ].join(':')

                  const evt = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true,
                  })

                  link.dispatchEvent(evt)
                  link.remove()
                }}
              >
                <FaIcon icon={faDownload} className="mr-2" /> Projekt
                herunterladen
              </button>
            </p>

            <p className="mt-3">
              <button
                className="bg-gray-100 hover:bg-red-200 px-3 py-2 rounded my-3"
                onClick={() => {
                  const result = confirm('Projekt wirklich löschen?')
                  if (result) {
                    runtime.getRuntime().exit()
                    localStorage.removeItem(
                      `purplej_project_${UIStore.getRawState().projectId}`,
                    )
                    UIStore.update((s) => {
                      s.page = 'home'
                    })
                  }
                }}
              >
                <FaIcon icon={faTrashCan} className="mr-2" /> Projekt löschen
              </button>
            </p>
            <p className="mt-3 border-t border-2 mr-3"></p>
            <p>Dateien verwalten (TODO)</p>
            <p>Interaktionen verwalten (TODO)</p>
            <p>Zwischenversion speichern</p>
          </div>
          <div>
            <p className="mb-2 text-gray-600">
              <button className="hover:underline hover:black">Impressum</button>{' '}
              | powered by CheerpJ
            </p>
          </div>
        </div>
        <div className="h-11 bg-gray-50 flex-grow-0 flex-shrink-0 flex justify-between items-baseline border-b-2 border-b-purple-300">
          <div className="flex items-baseline justify-start gap-4 pl-4">
            <button
              className={clsx(
                ' px-2 py-0.5 rounded mr-5 transition-colors',
                showMenu
                  ? 'bg-purple-200 hover:bg-purple-300'
                  : 'bg-gray-200 hover:bg-gray-300',
              )}
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
                  ? 'mt-2 pb-2.5 rounded-bl-none rounded-br-none bg-purple-300 '
                  : 'bg-purple-100 hover:bg-purple-200',
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
                    ? 'bg-pink-200 mt-2 pb-2 rounded-bl-none rounded-br-none'
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
                    s.project!.classes.push({
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
                  s.project!.output = e.target.value as 'terminal' | 'display'
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
