import { UIStore } from '@/store/UIStore'
import { useJavaRuntime } from './JavaRuntime'
import clsx from 'clsx'
import { FaIcon } from './FaIcon'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { Spinner } from './Spinner'
import { saveProject } from '@/actions/save-project'
import { Fragment } from 'react'

export function ObjectBench() {
  const controllerState = UIStore.useState((s) => s.controllerState)
  const dirtyClasses = UIStore.useState((s) => s.dirtyClasses)
  const inAction = UIStore.useState((s) => s.inAction)
  const syntheticMainCompiled = UIStore.useState((s) => s.syntheticMainCompiled)
  const api = UIStore.useState((s) => s.api)

  const runtime = useJavaRuntime()

  return (
    <div className={clsx('h-full', inAction && 'cursor-wait')}>
      {controllerState === 'loading' && (
        <div className="flex justify-center items-center h-full">
          <p className="italic text-gray-600 pb-6 animate-pulse">
            Java-System wird geladen ...
          </p>
        </div>
      )}
      {controllerState === 'compiling' && (
        <div className="flex justify-center items-center h-full">
          <p className="text-purple-600 pb-6">
            <Spinner />
            Klassen werden kompiliert ... einen kleinen Moment Geduld 🙏
          </p>
        </div>
      )}
      {controllerState === 'compile-if-dirty' && (
        <div className="flex justify-center items-center h-full">
          <p className="pb-2">
            <button
              className="px-3 py-2 bg-purple-400 hover:bg-purple-500 rounded"
              onClick={async () => {
                saveProject()

                if (dirtyClasses.length > 0 || !syntheticMainCompiled) {
                  await runtime.getRuntime().compile()
                }
                runtime.getRuntime().run()
              }}
            >
              <FaIcon icon={faPlay} className="mr-3" />
              {dirtyClasses.length == 0 && syntheticMainCompiled ? (
                <>Interaktiven Modus starten</>
              ) : (
                <>Kompilieren und interaktiven Modus starten</>
              )}
            </button>
          </p>
        </div>
      )}
      {controllerState === 'running' && (
        <div className="flex justify-start items-center h-full">
          {Object.entries(runtime.getRuntime().heap).map(([key, val]) => {
            return (
              <div
                key={key}
                className="h-[100px] bg-purple-300 mx-3 flex items-center px-2 rounded-xl text-center"
              >
                {key} :<br />
                {val.type}
              </div>
            )
          })}
          {
            <div className="dropdown dropdown-top dropdown-start">
              <div
                tabIndex={0}
                role="button"
                className="ml-3 px-2 py-0.5 bg-green-200 hover:bg-green-300 rounded text-center"
              >
                Objekt
                <br />
                erzeugen
              </div>
              <div
                tabIndex={0}
                className="dropdown-content bg-gray-100 rounded-box z-[1000] p-2 shadow mb-3 w-fit"
              >
                {Object.entries(api).map(([key, val]) => {
                  return (
                    <Fragment key={key}>
                      {val.constructors.map((params, i) => (
                        <div
                          key={i}
                          role="button"
                          className="my-2 px-1 bg-white hover:bg-green-100"
                          onClick={() => {
                            void (async () => {
                              UIStore.update((s) => {
                                s.inAction = true
                              })
                              try {
                                const C = await runtime.getRuntime().lib[key]
                                const instance = await new C()
                                let i = 1
                                let instanceName = ''
                                do {
                                  instanceName = `${key.toLowerCase()}${i}`
                                  i++
                                } while (
                                  runtime.getRuntime().heap[instanceName]
                                )
                                runtime.getRuntime().heap[instanceName] = {
                                  pointer: instance,
                                  type: key,
                                }
                                UIStore.update((s) => {
                                  s.instances.push({
                                    name: instanceName,
                                    type: key,
                                  })
                                  s.inAction = false
                                })
                                if ('blur' in (document.activeElement ?? {})) {
                                  // @ts-expect-error wrwr
                                  document.activeElement.blur()
                                }
                              } catch (e) {
                                console.log(e)
                                alert('Fehler beim Erzeugen des Objekts')
                                UIStore.update((s) => {
                                  s.inAction = false
                                })
                              }
                            })()
                          }}
                        >
                          new&nbsp;{key}(TODO)
                        </div>
                      ))}
                    </Fragment>
                  )
                })}
              </div>
            </div>
          }
          {/*runtime
              .getRuntime()
              .getInteractiveElements()
              .map((el, i) => (
                <button
                  key={i}
                  className={clsx(
                    'm-1 px-1 py-0.5 bg-gray-200 rounded',
                    inAction ? 'cursor-wait' : 'hover:bg-gray-300',
                  )}
                  onClick={() => {
                    if (!inAction) {
                      el.action()
                    }
                  }}
                >
                  {el.code}
                </button>
              ))*/}
        </div>
      )}
    </div>
  )
}
