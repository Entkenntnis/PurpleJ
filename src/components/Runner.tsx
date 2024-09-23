import { ClassAPI, Runtime } from '@/data/types'
import { UIStore } from '@/store'
import clsx from 'clsx'
import Script from 'next/script'
import { useEffect, useRef } from 'react'

export function Runner() {
  const controllerState = UIStore.useState((s) => s.controllerState)
  const cheerpjUrl = UIStore.useState((s) => s.cheerpjUrl)
  const dirtyClasses = UIStore.useState((s) => s.dirtyClasses)
  const classes = UIStore.useState((s) => s.classes)
  const api = UIStore.useState((s) => s.api)
  const displayRef = useRef<HTMLDivElement>(null)
  const instances = UIStore.useState((s) => s.instances)
  const inAction = UIStore.useState((s) => s.inAction)
  useEffect(() => {
    if (controllerState === 'loading' && !cheerpjUrl) {
      void (async () => {
        const url = (
          await (
            await fetch('https://cjrtnc.leaningtech.com/LATEST.txt')
          ).text()
        ).trim()
        UIStore.update((s) => {
          s.cheerpjUrl = url
        })
      })()
    }
  }, [controllerState, cheerpjUrl])

  const runtime = useRef<Runtime>({
    exit() {
      // TODO: default runtime
    },
    lib: {},
    heap: {},
  })

  const interactiveElements: { code: string; action: () => void }[] = []

  Object.entries(api).forEach(([name, api]) => {
    if (api.hasPublicConstructor) {
      interactiveElements.push({
        code: `new ${name}(${api.publicConstructorParams.map((el) => `${el.type} ${el.name}`).join(', ')})`,
        action: () => {
          void (async () => {
            UIStore.update((s) => {
              s.inAction = true
            })
            const C = await runtime.current.lib[name]
            const instance = await new C()
            let i = 1
            let instanceName = ''
            do {
              instanceName = `${name.toLowerCase()}${i}`
              i++
            } while (runtime.current.heap[instanceName])
            runtime.current.heap[instanceName] = instance
            UIStore.update((s) => {
              s.instances.push({ name: instanceName, type: name })
              s.inAction = false
            })
          })()
        },
      })
    }
  })
  instances.forEach(({ name, type }) => {
    api[type].publicMethods.forEach((method) => {
      if (method.parameters.some((p) => p.type !== 'int')) return
      interactiveElements.push({
        code: `${
          method.returnType !== 'void' ? method.returnType + ' ' : ''
        }${name}.${method.name}(${method.parameters.map((el) => `${el.type} ${el.name}`).join(', ')})`,
        action: () => {
          const params: number[] = []
          for (let i = 0; i < method.parameters.length; i++) {
            params.push(
              parseInt(
                prompt(`Gib Zahl ein für ${method.parameters[i].name}`) ?? '0',
              ),
            )
          }
          void (async () => {
            const instance = runtime.current.heap[name]
            UIStore.update((s) => {
              s.inAction = true
            })
            await instance[method.name](...params)
            UIStore.update((s) => {
              s.inAction = false
            })
          })()
        },
      })
    })
  })

  return (
    <>
      {cheerpjUrl && (
        <Script
          src={cheerpjUrl}
          onLoad={async () => {
            await cheerpjInit({
              status: 'none',
              preloadResources: {
                '/lt/8/jre/lib/rt.jar': [
                  0, 131072, 9699328, 9830400, 9961472, 10878976, 11403264,
                  11665408, 11927552, 12189696, 12320768, 12582912, 14942208,
                  15073280, 15204352, 15335424, 15466496, 15597568, 17694720,
                  17825792, 18350080, 18612224, 19005440, 19136512, 20840448,
                  21757952, 22020096, 22937600, 23068672, 26869760,
                ],
                '/lt/8/jre/lib/cheerpj-awt.jar': [0, 131072],
                '/lt/etc/passwd': [0, 131072],
                '/lt/etc/localtime': [],
                '/lt/8/ext/meta-index': [0, 131072],
                '/lt/8/ext': [],
                '/lt/8/ext/index.list': [],
                '/lt/8/ext/sunjce_provider.jar': [0, 262144],
                '/lt/8/jre/lib/jsse.jar': [0, 131072, 786432, 917504],
                '/lt/8/jre/lib/jce.jar': [0, 131072],
                '/lt/8/jre/lib/charsets.jar': [0, 131072, 1703936, 1835008],
                '/lt/8/jre/lib/resources.jar': [0, 131072, 917504, 1179648],
                '/lt/8/jre/lib/javaws.jar': [0, 131072, 1441792, 1703936],
                '/lt/8/jre/lib/meta-index': [0, 131072],
                '/lt/8/jre/lib': [],
                '/lt/8/lib/ct.sym': [],
              },
              natives: {
                async Java_SyntheticMain_entry(lib: object) {
                  /*console.log('Hi!')
                  window.lib = lib
                  console.log(lib)*/
                  //const circle = await lib.Circle.getInstance()
                  //await circle.makeVisible()
                  runtime.current.lib = lib
                  prepareInteractiveMode()
                  await new Promise((res) => {
                    runtime.current.exit = () => {
                      res(null)
                    }
                  })
                },
              },
            })
            cheerpjCreateDisplay(-1, -1, displayRef.current)
            await cheerpjRunMain(
              'com.sun.tools.javac.Main',
              '/app/tools.jar',
              '-version',
            )
            UIStore.update((s) => {
              s.controllerState = 'compile-if-dirty'
              s.dirtyClasses = s.classes.map((c) => c.name)
            })
          }}
        />
      )}
      <div className="h-full flex flex-col">
        <div className="flex-grow-0 h-[350px] flex">
          <div
            className={clsx(
              'flex-1 p-3 bg-yellow-50 overflow-auto',
              inAction && 'animate-pulse',
            )}
          >
            {controllerState === 'loading' && (
              <p>Java-System wird geladen ...</p>
            )}
            {controllerState === 'compiling' && (
              <p>Klassen werden kompiliert ...</p>
            )}
            {controllerState === 'compile-if-dirty' && (
              <p>
                <button
                  className="px-2 py-0.5 bg-green-300 hover:bg-green-400 rounded"
                  onClick={async () => {
                    if (dirtyClasses.length > 0) {
                      // This is the compile step
                      const encoder = new TextEncoder()
                      const sourceFiles = ['/str/SyntheticMain.java']

                      cheerpOSAddStringFile(
                        sourceFiles[0],
                        encoder.encode(`class SyntheticMain {
                            public static void main(String[] args) {
                              System.out.println("Interaktiver Modus bereit");
                              entry();
                              System.out.println("VM fährt herunter");
                              System.exit(0);
                            }
                            public static native void entry();
                          }`),
                      )

                      for (const c of dirtyClasses) {
                        const filename = `/str/${c}.java`
                        cheerpOSAddStringFile(
                          filename,
                          encoder.encode(
                            classes.find((el) => el.name == c)!.content,
                          ),
                        )
                        sourceFiles.push(filename)
                      }
                      UIStore.update((s) => {
                        s.controllerState = 'compiling'
                      })

                      document.getElementById('console')!.innerHTML = ''
                      /*const code =*/ await cheerpjRunMain(
                        'com.sun.tools.javac.Main',
                        '/app/tools.jar:/files/',
                        ...sourceFiles,
                        '-d',
                        '/files/',
                        '-Xlint:-serial',
                      )
                    }
                    UIStore.update((s) => {
                      s.controllerState = 'running'
                      s.dirtyClasses = []
                      s.instances = []
                      s.inAction = false
                    })
                    document.getElementById('console')!.innerHTML = ''
                    runtime.current.heap = {}
                    await cheerpjRunMain('SyntheticMain', '/files/')
                    UIStore.update((s) => {
                      s.controllerState = 'compile-if-dirty'
                      s.dirtyClasses = []
                    })
                  }}
                >
                  {dirtyClasses.length == 0 ? (
                    'Ausführen'
                  ) : (
                    <>{dirtyClasses.length} Klassen kompilieren und ausführen</>
                  )}
                </button>
              </p>
            )}
            {controllerState === 'running' && (
              <div>
                <p>
                  VM gestartet
                  <button
                    onClick={() => {
                      runtime.current.exit()
                    }}
                    className="ml-6 px-2 py-0.5 bg-red-300 hover:bg-red-400 rounded"
                  >
                    VM zurücksetzen
                  </button>
                </p>
                <div className="mt-3 flex flex-wrap justify-start">
                  {interactiveElements.map((el, i) => (
                    <button
                      key={i}
                      className="m-3 px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded"
                      onClick={el.action}
                    >
                      {el.code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex-grow bg-teal-50">
          <pre
            className="font-mono text-sm h-full overflow-auto m-3"
            id="console"
          />
        </div>
        <div className={clsx('h-[400px] flex-grow-0')} ref={displayRef}></div>
      </div>
    </>
  )

  function prepareInteractiveMode() {
    Object.values(classes).forEach((c) => {
      const javaClassString = c.content
      const classAPI: ClassAPI = {
        hasPublicConstructor: false,
        publicConstructorParams: [],
        publicMethods: [],
      }
      // Regex für öffentlichen Konstruktor
      const constructorRegex = new RegExp(
        `public\\s+${c.name}\\s*\\(([^)]*)\\)`,
      )
      const constructorMatch = javaClassString.match(constructorRegex)

      if (constructorMatch) {
        classAPI.hasPublicConstructor = true
        const params = constructorMatch[1].trim()
        if (params.length > 0) {
          classAPI.publicConstructorParams = params
            .split(/\s*,\s*/)
            .map((param) => {
              const [type, name] = param.trim().split(/\s+/)
              return { name, type }
            })
        }
      }

      // Regex für öffentliche Methoden
      const methodRegex =
        /public\s+([a-zA-Z0-9_<>\[\]]+)\s+([a-zA-Z0-9_]+)\s*\(([^)]*)\)/g
      let methodMatch

      while ((methodMatch = methodRegex.exec(javaClassString)) !== null) {
        const returnType = methodMatch[1].trim()
        const methodName = methodMatch[2].trim()
        const params = methodMatch[3].trim()

        const paramList =
          params.length > 0
            ? params.split(/\s*,\s*/).map((param) => {
                const [type, name] = param.trim().split(/\s+/)
                return { name, type }
              })
            : []

        classAPI.publicMethods.push({
          name: methodName,
          returnType: returnType,
          parameters: paramList,
        })
      }
      UIStore.update((s) => {
        s.api[c.name] = classAPI
      })
    })
  }
}
