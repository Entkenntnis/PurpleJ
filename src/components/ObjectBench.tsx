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
  const showOutput = UIStore.useState((s) => s.showOutput)

  const runtime = useJavaRuntime()

  return (
    <div className={clsx('h-full relative')}>
      <div
        className={clsx(
          'absolute inset-0 z-[10] bg-gray-200 flex items-center justify-center transition-opacity duration-500',
          inAction ? 'opacity-50' : 'pointer-events-none opacity-0 duration-0',
        )}
      >
        <Spinner />
      </div>
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
            Klassen werden kompiliert ...
          </p>
        </div>
      )}
      {(controllerState === 'compile-if-dirty' ||
        (controllerState === 'running' && !showOutput)) && (
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
      {controllerState === 'running' && showOutput && (
        <div className="flex justify-start items-center h-full">
          {Object.entries(runtime.getRuntime().heap).map(([key, val]) => {
            return (
              <div key={key} className="dropdown dropdown-top dropdown-start">
                <div
                  className="h-[100px] bg-purple-300 mx-3 flex items-center px-2 rounded-xl text-center"
                  tabIndex={0}
                  role="button"
                >
                  {key} :<br />
                  {val.type}
                </div>
                <div
                  tabIndex={0}
                  className="dropdown-content bg-gray-100 rounded-box z-[1000] p-2 shadow ml-3 w-fit max-h-[50vh] overflow-y-auto"
                >
                  {api[val.type].methods.map(({ name, parameters }, i) => {
                    return (
                      <div
                        key={i}
                        role="button"
                        className="my-2 px-1 bg-white hover:bg-green-100"
                        onClick={() => {
                          void (async () => {
                            UIStore.update((s) => {
                              s.inAction = true
                            })
                            if ('blur' in (document.activeElement ?? {})) {
                              // @ts-expect-error wrwr
                              document.activeElement.blur()
                            }
                            try {
                              const SyntheticMain =
                                await runtime.getRuntime().lib.SyntheticMain

                              const params: (number | string)[] = []
                              const cArgs = []
                              for (let i = 0; i < parameters.length; i++) {
                                if (parameters[i].type == 'int') {
                                  cArgs.push(await SyntheticMain.getIntClass())
                                  params.push(
                                    parseInt(
                                      prompt(
                                        `Gib Zahl ein für ${parameters[i].name}:`,
                                      ) ?? '0',
                                    ),
                                  )
                                } else if (parameters[i].type == 'String') {
                                  cArgs.push(
                                    await SyntheticMain.getStringClass(),
                                  )
                                  params.push(
                                    prompt(
                                      `Gib Text ein für ${parameters[i].name}:`,
                                    ) ?? '',
                                  )
                                } else {
                                  cArgs.push(
                                    await SyntheticMain.getClass(
                                      parameters[i].type,
                                    ),
                                  )
                                  params.push(
                                    runtime.getRuntime().heap[
                                      prompt(
                                        `Gib den Namen eines Objektes ein vom Typ ${parameters[i].type} an:`,
                                      ) ?? ''
                                    ].pointer,
                                  )
                                }
                              }

                              const C = await SyntheticMain.getClass(val.type)

                              const method = await C.getDeclaredMethod(
                                name,
                                cArgs,
                              )
                              await method.invoke(val.pointer, params)

                              // await val.pointer[name](...params)

                              UIStore.update((s) => {
                                s.inAction = false
                              })
                            } catch (e) {
                              console.log(e)
                              alert('Fehler beim Aufruf')
                              UIStore.update((s) => {
                                s.inAction = false
                              })
                            }
                          })()
                        }}
                      >
                        {name}(
                        {parameters
                          .map((p) => `${p.type}\xa0${p.name}`)
                          .join(', ')}
                        )
                      </div>
                    )
                  })}
                  <div
                    role="button"
                    className="my-2 px-1 bg-white hover:bg-red-100 rounded"
                    onClick={() => {
                      UIStore.update((s) => {
                        s.inAction = true
                      })
                      delete runtime.getRuntime().heap[key]
                      UIStore.update((s) => {
                        s.inAction = false
                      })
                    }}
                  >
                    Entfernen
                  </div>
                </div>
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
                      {val.constructors.map((parameters, i) => (
                        <div
                          key={i}
                          role="button"
                          className="my-2 px-1 bg-white hover:bg-green-100"
                          onClick={() => {
                            void (async () => {
                              UIStore.update((s) => {
                                s.inAction = true
                              })
                              if ('blur' in (document.activeElement ?? {})) {
                                // @ts-expect-error wrwr
                                document.activeElement.blur()
                              }

                              try {
                                const SyntheticMain =
                                  await runtime.getRuntime().lib.SyntheticMain
                                const C = await SyntheticMain.getClass(key)

                                const params: (number | string)[] = []
                                const cArgs = []
                                for (let i = 0; i < parameters.length; i++) {
                                  if (parameters[i].type == 'int') {
                                    cArgs.push(
                                      await SyntheticMain.getIntClass(),
                                    )
                                    params.push(
                                      parseInt(
                                        prompt(
                                          `Gib Zahl ein für ${parameters[i].name}:`,
                                        ) ?? '0',
                                      ),
                                    )
                                  }
                                  if (parameters[i].type == 'String') {
                                    cArgs.push(
                                      await SyntheticMain.getStringClass(),
                                    )
                                    params.push(
                                      prompt(
                                        `Gib Text ein für ${parameters[i].name}:`,
                                      ) ?? '',
                                    )
                                  }
                                }

                                console.log(cArgs)

                                const constructor =
                                  await C.getDeclaredConstructor(cArgs)

                                /*console.log(constructors)

                                for (let i = 0; i < constructors.length; i++) {
                                  console.log(
                                    'Konstruktor',
                                    await constructors[i].getName(),
                                  )
                                  const params =
                                    await constructors[i].getParameterTypes()
                                  for (let j = 0; j < params.length; j++) {
                                    console.log(await params[j].getName())
                                  }
                                }*/

                                const instance =
                                  await constructor.newInstance(params)

                                // Step 2: Create an instance of ZWERG using newInstance()
                                // Object zwergInstance = zwergClass.getDeclaredConstructor().newInstance();

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
                          new&nbsp;{key}(
                          {parameters
                            .map((p) => `${p.type}\xa0${p.name}`)
                            .join(', ')}
                          )
                        </div>
                      ))}
                    </Fragment>
                  )
                })}
              </div>
            </div>
          }
        </div>
      )}
    </div>
  )
}
