import { ClassDiagram } from '@/components/ClassDiagram'
import { Editor } from '@/components/Editor'
import { Guide } from '@/components/Guide'
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
import { useEffect, useRef, useState } from 'react'
import { saveProject } from '@/actions/save-project'
import { MetaEditor } from './MetaEditor'
import { Resources } from './Resources'
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex'

export default function IDE() {
  const openClasses = UIStore.useState((s) => s.openClasses)
  const openClass = UIStore.useState((s) => s.openClass)
  const dirtyClasses = UIStore.useState((s) => s.dirtyClasses)
  const output = UIStore.useState((s) => s.project!.output)
  const showEditMetaTab = UIStore.useState((s) => s.showEditMetaTab)
  const editMeta = UIStore.useState((s) => s.editMeta)
  const showResourcesTab = UIStore.useState((s) => s.showResourcesTab)
  const editResources = UIStore.useState((s) => s.editResources)
  const files = UIStore.useState((s) => s.project!.files)
  const controllerState = UIStore.useState((s) => s.controllerState)
  const showOutput = UIStore.useState((s) => s.showOutput)
  const inAction = UIStore.useState((s) => s.inAction)

  const runtime = useJavaRuntime()

  const displayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    runtime.getRuntime().displayElement = displayRef.current
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayRef.current])

  const [showMenu, setShowMenu] = useState(false)

  return (
    <>
      <div className="h-full flex flex-col">
        <div
          className={clsx(
            'absolute top-[42px] bottom-0 w-[300px] bg-white border-purple-300 border-r-2 border-t-2 rounded-tr-xl rounded-br-xl z-[200] pl-3',
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
            <p>
              <button
                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded my-3"
                onClick={() => {
                  UIStore.update((s) => {
                    s.showResourcesTab = true
                    s.editResources = true
                    s.openClass = null
                    s.editMeta = false
                  })
                  setShowMenu(false)
                }}
              >
                Dateien verwalten
                {files && files.length > 0 && <> ({files.length})</>}
              </button>
            </p>
          </div>
          <div>
            <p className="mb-2 text-gray-600">
              <button className="hover:underline hover:black">Impressum</button>{' '}
              | powered by CheerpJ
            </p>
          </div>
        </div>
        <div className="h-11 bg-gray-50 flex-grow-0 flex-shrink-0 flex justify-between border-b-2 border-b-purple-300">
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
                openClass === null && !editMeta && !editResources && !showOutput
                  ? 'mt-2 pb-2 rounded-bl-none rounded-br-none bg-yellow-300 '
                  : 'bg-yellow-100 hover:bg-yellow-200',
              )}
              onClick={() => {
                UIStore.update((s) => {
                  s.openClass = null
                  s.editMeta = false
                  s.editResources = false
                  s.showOutput = false
                })
              }}
            >
              Klassenübersicht
            </button>
            {showEditMetaTab && (
              <div
                className={clsx(
                  'px-2 py-0.5 rounded cursor-pointer flex items-baseline',
                  editMeta
                    ? 'mt-2 pb-2.5 rounded-bl-none rounded-br-none bg-purple-300 '
                    : 'bg-purple-100 hover:bg-purple-200',
                )}
                onClick={() => {
                  UIStore.update((s) => {
                    s.openClass = null
                    s.editMeta = true
                  })
                }}
              >
                Beschreibung
                <button
                  className="inline-block flex items-center justify-center p-0.5 pb-1 h-4 rounded bg-white ml-3 hover:bg-red-500"
                  onClick={(e) => {
                    UIStore.update((s) => {
                      s.editMeta = false
                      s.showEditMetaTab = false
                      s.openClass = null
                      s.showOutput = false
                    })
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  ×
                </button>
              </div>
            )}
            {controllerState == 'running' && (
              <div
                className={clsx(
                  'px-2 py-0.5 rounded cursor-pointer flex items-baseline',
                  showOutput
                    ? 'mt-2 pb-1.5 rounded-bl-none rounded-br-none bg-purple-400 '
                    : 'bg-purple-200 hover:bg-purple-300',
                )}
                onClick={() => {
                  UIStore.update((s) => {
                    s.openClass = null
                    s.editMeta = false
                    s.editResources = false
                    s.showOutput = true
                  })
                }}
              >
                Ausgabe:{' '}
                <select
                  className="p-1 ml-3 rounded"
                  value={output}
                  onChange={(e) => {
                    UIStore.update((s) => {
                      s.project!.output = e.target.value as
                        | 'terminal'
                        | 'display'
                    })
                  }}
                >
                  <option value="display">Bildschirm</option>
                  <option value="terminal">Terminal</option>
                </select>
                <button
                  className={clsx(
                    'inline-block flex items-center justify-center p-0.5 pb-1 h-4 rounded bg-white ml-3 hover:bg-red-500',
                    inAction && 'opacity-50',
                  )}
                  disabled={inAction}
                  onClick={(e) => {
                    runtime.getRuntime().exit()
                    UIStore.update((s) => {
                      s.showOutput = false
                    })
                    e.preventDefault()
                    e.stopPropagation()
                  }}
                >
                  ×
                </button>
              </div>
            )}
            {showResourcesTab && (
              <div
                className={clsx(
                  'px-2 py-0.5 rounded cursor-pointer flex items-baseline',
                  editResources
                    ? 'mt-2 pb-2.5 rounded-bl-none rounded-br-none bg-purple-300 '
                    : 'bg-purple-100 hover:bg-purple-200',
                )}
                onClick={() => {
                  UIStore.update((s) => {
                    s.openClass = null
                    s.editMeta = false
                    s.editResources = true
                    s.showOutput = false
                  })
                }}
              >
                Dateien
                <button
                  className="inline-block flex items-center justify-center p-0.5 pb-1 h-4 rounded bg-white ml-3 hover:bg-red-500"
                  onClick={(e) => {
                    UIStore.update((s) => {
                      s.editResources = false
                      s.showResourcesTab = false
                      s.openClass = null
                    })
                    e.stopPropagation()
                    e.preventDefault()
                  }}
                >
                  ×
                </button>
              </div>
            )}
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
                    s.editMeta = false
                    s.editResources = false
                    s.showOutput = false
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
            {controllerState != 'running' && (
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
                      s.dirtyClasses.push(name)
                    })
                  }
                }}
              >
                + Neue Klasse
              </button>
            )}
          </div>
          <div className="pr-4 mt-1.5"></div>
        </div>
        <div className="h-[calc(100%-44px)]">
          <ReflexContainer orientation="vertical" windowResizeAware>
            <ReflexElement
              className="h-full !overflow-hidden relative"
              minSize={0}
            >
              <div className="flex flex-col h-full">
                <div className="h-[calc(100%-120px)] relative">
                  <div
                    className={clsx(
                      'absolute inset-0 bg-blue-100',
                      output !== 'display' || !showOutput
                        ? 'opacity-0 z-0 pointer-events-none'
                        : 'z-10',
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
                      output !== 'terminal' || !showOutput
                        ? 'opacity-0 z-0 pointer-events-none'
                        : 'z-10',
                    )}
                  >
                    <pre
                      className="font-mono text-sm h-full px-1 text-wrap"
                      id="console"
                    />
                  </div>
                  {editResources ? (
                    <Resources />
                  ) : editMeta ? (
                    <MetaEditor />
                  ) : openClass == null ? (
                    <ClassDiagram />
                  ) : (
                    <Editor />
                  )}
                </div>
                <div className="h-[120px] border-t-2 border-purple-300">
                  <ObjectBench />
                </div>
              </div>
            </ReflexElement>
            <ReflexSplitter
              style={{ width: 6 }}
              className="!bg-purple-200 !border-0 hover:!bg-purple-400 active:!bg-purple-400"
            />
            <ReflexElement minSize={0}>
              <Guide />
            </ReflexElement>
          </ReflexContainer>

          <div className="w-[500px]"></div>
        </div>
      </div>
    </>
  )
}
