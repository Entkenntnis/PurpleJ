import { ClassAPI, InteractiveElement, Runtime } from '@/data/types'
import { UIStore } from '@/store/UIStore'
import Script from 'next/script'
import { createContext, ReactNode, useContext, useEffect, useRef } from 'react'

const JavaRuntimeContext = createContext<{ getRuntime: () => Runtime }>({
  getRuntime() {
    throw new Error('Context used outside of provider')
  },
})

export function useJavaRuntime() {
  return useContext(JavaRuntimeContext)
}

export function JavaRuntime({ children }: { children: ReactNode }) {
  const runtime = useRef<Runtime>({
    run,
    compile,
    displayElement: null,
    getInteractiveElements,
    exit() {},
    lib: {},
    heap: {},
    standardLib: {},
  })

  const cheerpjUrl = UIStore.useState((s) => s.cheerpjUrl)

  useEffect(() => {
    if (UIStore.getRawState().controllerState == 'loading' && !cheerpjUrl) {
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
  }, [cheerpjUrl])

  return (
    <>
      {cheerpjUrl && <Script src={cheerpjUrl} onLoad={onLoad} />}
      <JavaRuntimeContext.Provider
        value={{ getRuntime: () => runtime.current }}
      >
        {children}
      </JavaRuntimeContext.Provider>
    </>
  )

  async function onLoad() {
    await cheerpjInit({
      status: 'none',
      preloadResources: {
        '/lt/8/jre/lib/rt.jar': [
          0, 131072, 9699328, 9830400, 9961472, 10878976, 11403264, 11665408,
          11927552, 12189696, 12320768, 12582912, 14942208, 15073280, 15204352,
          15335424, 15466496, 15597568, 17694720, 17825792, 18350080, 18612224,
          19005440, 19136512, 20840448, 21757952, 22020096, 22937600, 23068672,
          26869760,
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
          // @ts-expect-error Expose to client
          window.lib = lib
          runtime.current.lib = lib
          prepareInteractiveMode()
          UIStore.update((s) => {
            s.inAction = false
          })
          await new Promise((res) => {
            runtime.current.exit = () => {
              runtime.current.exit = () => {}
              res(null)
            }
          })
        },
      },
    })

    // System is loaded, what to do next?

    runtime.current.standardLib = await cheerpjRunLibrary('')

    if (UIStore.getRawState().page !== 'ide') {
      // warm up by loading javac
      await cheerpjRunMain(
        'com.sun.tools.javac.Main',
        '/app/tools.jar',
        '-version',
      )

      UIStore.update((s) => {
        s.controllerState = 'compile-if-dirty'
        // s.dirtyClasses = s.classes.map((c) => c.name)
      })
    } else {
      compile()
    }
  }

  async function compile() {
    UIStore.update((s) => {
      s.controllerState = 'compiling'
    })
    const ui = UIStore.getRawState()

    const d = `/files/${ui.projectId}/`

    // This is the compile step
    const encoder = new TextEncoder()
    const sourceFiles = [`/str/${ui.projectId}/SyntheticMain.java`]

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

    const File = await runtime.current.standardLib.java.io.File
    const f = await new File(d)
    await f.mkdir()

    if (ui.project && ui.project.files) {
      const Files = await runtime.current.standardLib.java.nio.file.Files
      const StandardCopyOption =
        await runtime.current.standardLib.java.nio.file.StandardCopyOption
      for (const file of ui.project.files) {
        const src = `/str/${ui.projectId}/` + file.name
        cheerpOSAddStringFile(src, encoder.encode(file.content))
        const p1 = await (await new File(src)).toPath()
        const f2 = await new File('/files/' + file.name)
        const parent = await f2.getParentFile()
        await parent.mkdirs()
        const p2 = await f2.toPath()
        await Files.copy(p1, p2, [StandardCopyOption.REPLACE_EXISTING])
      }
    }

    for (const c of ui.dirtyClasses) {
      const filename = `/str/${ui.projectId}/${c}.java`
      cheerpOSAddStringFile(
        filename,
        encoder.encode(ui.project!.classes.find((el) => el.name == c)!.content),
      )
      sourceFiles.push(filename)
    }

    document.getElementById('console')!.innerHTML = ''

    const code = await cheerpjRunMain(
      'com.sun.tools.javac.Main',
      '/app/tools.jar:/files/:' + d,
      ...sourceFiles,
      '-d',
      d,
      '-Xlint:-serial,-unchecked',
    )
    if (code === 0) {
      UIStore.update((s) => {
        s.controllerState = 'compile-if-dirty'
        s.syntheticMainCompiled = true
        s.dirtyClasses = []
      })
    } else {
      UIStore.update((s) => {
        s.controllerState = 'compile-if-dirty'
        s.syntheticMainCompiled = false
      })
    }
  }

  async function run() {
    const ui = UIStore.getRawState()
    const d = `/files/${ui.projectId}/`
    UIStore.update((s) => {
      s.instances = []
      s.inAction = true
      s.api = {}
    })
    UIStore.update((s) => {
      s.controllerState = 'running'
      s.showOutput = true
    })
    document.getElementById('console')!.innerHTML = ''
    if (runtime.current.displayElement) {
      runtime.current.displayElement.innerHTML = ''
      cheerpjCreateDisplay(-1, -1, runtime.current.displayElement)
    }

    runtime.current.heap = {}
    prepareInteractiveMode()
    await cheerpjRunMain('SyntheticMain', d)
    // console.log('result', r)
    UIStore.update((s) => {
      s.controllerState = 'compile-if-dirty'
    })
  }

  function prepareInteractiveMode() {
    const ui = UIStore.getRawState()
    Object.values(ui.project!.classes).forEach((c) => {
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

  function getInteractiveElements() {
    const interactiveElements: InteractiveElement[] = []

    const ui = UIStore.getRawState()

    Object.entries(ui.api).forEach(([name, api]) => {
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
    ui.instances.forEach(({ name, type }) => {
      ui.api[type].publicMethods.forEach((method) => {
        if (
          method.parameters.some((p) => p.type !== 'int' && p.type !== 'String')
        )
          return
        interactiveElements.push({
          code: `${
            method.returnType !== 'void' ? method.returnType + ' ' : ''
          }${name}.${method.name}(${method.parameters.map((el) => `${el.type} ${el.name}`).join(', ')})`,
          action: () => {
            const params: (number | string)[] = []
            for (let i = 0; i < method.parameters.length; i++) {
              if (method.parameters[i].type == 'int')
                params.push(
                  parseInt(
                    prompt(`Gib Zahl ein für ${method.parameters[i].name}`) ??
                      '0',
                  ),
                )
              if (method.parameters[i].type == 'String') {
                params.push(
                  prompt(`Gib Text ein für ${method.parameters[i].name}`) ?? '',
                )
              }
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
    return interactiveElements
  }
}
