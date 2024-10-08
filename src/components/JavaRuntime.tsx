import { parseExercises } from '@/actions/parse-exercises'
import { ClassAPI, FormalParameters, Runtime } from '@/data/types'
import { AstNode, cursorToAstNode } from '@/lang/astNode'
import { UIStore } from '@/store/UIStore'
import { Text } from '@codemirror/state'
import { parser } from '@lezer/java'
import Script from 'next/script'
import { createContext, ReactNode, useContext, useRef } from 'react'

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
    exit() {},
    lib: {},
    heap: {},
    standardLib: {},
  })

  return (
    <>
      <Script
        src="https://cjrt.arrrg.de/cheerpj_3_20240906/cj3loader.js"
        onLoad={onLoad}
      />
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
        '/lt/8/jre/lib/cheerpj-awt.jar': [],
        '/lt/etc/passwd': [0, 131072],
        '/lt/etc/localtime': [],
        '/lt/8/ext/meta-index': [0, 131072],
        '/lt/8/ext/index.list': [],
        '/lt/8/ext/sunjce_provider.jar': [0, 262144],
        '/lt/8/jre/lib/jsse.jar': [0, 131072, 786432, 917504],
        '/lt/8/jre/lib/jce.jar': [0, 131072],
        '/lt/8/jre/lib/charsets.jar': [0, 131072, 1703936, 1835008],
        '/lt/8/jre/lib/resources.jar': [0, 131072, 917504, 1179648],
        '/lt/8/jre/lib/javaws.jar': [0, 131072, 1441792, 1703936],
        '/lt/8/jre/lib/meta-index': [0, 131072],
      },
      natives: {
        async Java_SyntheticMain_entry(lib: object) {
          // @ts-expect-error Expose to client
          window.lib = lib
          runtime.current.lib = lib
          prepareInteractiveMode()
          const exercises = UIStore.getRawState().exercises
          for (const ex of exercises) {
            try {
              const C = await runtime.current.lib[ex.className]
              const instance = await new C()
              await instance['onInteractive']()
            } catch (e) {
              console.log(e)
            }
          }
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
        async Java_PurpleJExercise_internalSetCompleted(
          lib: object,
          _: never,
          c: string,
        ) {
          UIStore.update((s) => {
            s.exercises.forEach((ex) => {
              if (ex.className == c) {
                ex.status = true
              }
            })
          })
        },
        async Java_PurpleJExercise_internalSetStatus(
          lib: object,
          _: never,
          c: string,
          msg: string,
        ) {
          UIStore.update((s) => {
            s.exercises.forEach((ex) => {
              if (ex.className == c) {
                ex.status = msg
              }
            })
          })
        },
        async Java_CustomFileInputStream_getCurrentInputString() {
          return new Promise((res) => {
            setTimeout(() => {
              const val = prompt()
              res((val ?? '') + '\n')
            }, 100)
          })
        },
      },
    })

    // System is loaded, what to do next?

    runtime.current.standardLib = await cheerpjRunLibrary('/app/tools.jar')

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
    parseExercises()
    const ui = UIStore.getRawState()

    const d = `/files/${ui.projectId}/`

    // This is the compile step
    const encoder = new TextEncoder()
    const sourceFiles = [
      `/str/${ui.projectId}/SyntheticMain.java`,
      `/str/${ui.projectId}/PurpleJExercise.java`,
      `/str/${ui.projectId}/CustomFileInputStream.java`,
    ]

    cheerpOSAddStringFile(
      sourceFiles[0],
      encoder.encode(`
        class SyntheticMain {
            public static void main(String[] args) {
                try {
                    System.setIn(new CustomFileInputStream());
                } catch (Exception e) {
                    System.out.println(e);
                }
                System.out.println("Interaktiver Modus bereit");
                entry();
                System.out.println("VM fährt herunter");
                System.exit(0);
            }
            public static native void entry();

            public static Class<?> getClass(String name) {
              try {
                return Class.forName(name);
              } catch (Exception e) {
                e.printStackTrace();
              }
              return null;
            }

            public static Class<?> getIntClass() {
              return int.class;
            }

            public static Class<?> getStringClass() {
              return String.class;
            }
        }`),
    )

    cheerpOSAddStringFile(
      sourceFiles[1],
      encoder.encode(`
        class PurpleJExercise {
           public void onInteractive() {}

           public void setCompleted() {
              String className = getClass().getName();
              internalSetCompleted(className);
           }

           public void setStatus(String s) {
              String className = getClass().getName();
              internalSetStatus(className, s);
           }

           public native void internalSetCompleted(String c);

           public native void internalSetStatus(String c, String s);
        }`),
    )

    cheerpOSAddStringFile(
      sourceFiles[2],
      encoder.encode(`
        import java.io.*;
        import java.util.concurrent.*;
        import java.util.*;
        import java.nio.file.*;
        import java.lang.reflect.*;
        import java.nio.charset.*;

        class CustomFileInputStream extends InputStream {
            public CustomFileInputStream() throws IOException { 
                super();
            }
            @Override
            public int available() throws IOException{
                return 0;
            }
            @Override 
            public int read() {
                return 0;
            }
            @Override
            public int read(byte[] b, int o, int l) throws IOException {
                while (true) {
                    // Block until the textbox has content
                    String cInpStr = getCurrentInputString();
                    while (cInpStr.length() != 0) {
                        // Read the textbox as bytes
                        int j = 0;
                        byte[] data = cInpStr.getBytes();
                        for (int i = 0; i < l - o; i++) {
                            if (i < data.length) {
                                j++;
                                b[i + o] = data[i];
                            }
                        }
                        return j;
                    }
                    // Wait before checking again
                    try {
                        Thread.sleep(100);
                    } catch (InterruptedException e) {
                        // in case the program gets interrupted before finishing (not really possible with cheerpj)
                        System.out.println("Interrupted");
                    }
                }
            }
            @Override
            public int read(byte[] b) throws IOException {
                return read(b, 0, b.length);
            }

            // implemented in javascript
            public static native String getCurrentInputString();
            public static native void clearCurrentInputString();
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

    //document.getElementById('console')!.innerHTML = ''
    const cp = d + (ui.project!.libs ? ':' + ui.project!.libs : '')

    const javac = await runtime.current.standardLib.com.sun.tools.javac.Main
    const code = await javac.compile([
      ...sourceFiles,
      '-cp',
      cp,
      '-d',
      d,
      '-Xlint:-serial,-unchecked',
    ])

    // console.log(code)

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
    const cp =
      `/files/${ui.projectId}/` +
      (ui.project!.libs ? ':' + ui.project!.libs : '')
    UIStore.update((s) => {
      s.instances = []
      s.inAction = true
      s.api = {}
    })
    UIStore.update((s) => {
      s.controllerState = 'running'
      s.showOutput = true
    })
    //document.getElementById('console')!.innerHTML = ''
    if (runtime.current.displayElement) {
      runtime.current.displayElement.innerHTML = ''
      cheerpjCreateDisplay(-1, -1, runtime.current.displayElement)
    }

    runtime.current.heap = {}
    prepareInteractiveMode()
    await cheerpjRunMain('SyntheticMain', cp)
    // console.log('result', r)
    UIStore.update((s) => {
      s.controllerState = 'compile-if-dirty'
    })
  }

  function parseFormalParameters(node: AstNode): FormalParameters {
    return node.children
      .filter((n) => n.name == 'FormalParameter')
      .map((n) => {
        // console.log(n.text())
        const [type, name] = n.text().split(' ')
        return { name, type }
      })
  }

  function prepareInteractiveMode() {
    const ui = UIStore.getRawState()
    Object.values(ui.project!.classes).forEach((c) => {
      const classAPI: ClassAPI = {
        constructors: [],
        methods: [],
      }
      const tree = parser.parse(c.content)
      const t = cursorToAstNode(tree.cursor(), Text.of(c.content.split('\n')))
      let hasPrivateConstructor = false
      const scan = (t: AstNode) => {
        const name =
          t.children.find((c) => c.name == 'Definition')?.text() ?? '???'
        const mod =
          t.children.find((c) => c.name == 'Modifiers')?.text() ?? 'protected'
        if (t.name == 'ConstructorDeclaration' && name == c.name) {
          // console.log('debug constructor', t.text(), mod)
          if (mod == 'private') {
            hasPrivateConstructor = true
            // console.log('private constructor detected')
          } else {
            // TODO formal parameters
            classAPI.constructors.push(
              parseFormalParameters(
                t.children.find((c) => c.name == 'FormalParameters')!,
              ),
            )
            // TODO const parameters = t.children.find(c => c.name == 'FormalParameters')
          }
        }
        if (
          t.name == 'MethodDeclaration' ||
          t.name == 'ConstructorDeclaration'
        ) {
          if (!mod.includes('private') && name != c.name) {
            classAPI.methods.push({
              returnType: 'void', // TODO
              name,
              parameters: parseFormalParameters(
                t.children.find((c) => c.name == 'FormalParameters')!,
              ),
            })
          }
        }
        t.children.forEach(scan)
      }
      scan(t)

      if (classAPI.constructors.length == 0 && !hasPrivateConstructor) {
        // default constructor
        classAPI.constructors.push([])
      }

      /*// Regex für öffentlichen Konstruktor
      const constructorRegex = new RegExp(
        `public\\s+${c.name}\\s*\\(([^)]*)\\)`,
      )
      const constructorMatch = javaClassString.match(constructorRegex)

      if (constructorMatch) {
        classAPI.hasPublicConstructor = true
        const params = constructorMatch[1].trim()
        if (params.length > 0) {
          classAPI.publicConstructorParams = params*/
      // .split(/\s*,\s*/)
      /*   .map((param) => {
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
          params.length > 0*/
      // ? params.split(/\s*,\s*/).map((param) => {
      /*     const [type, name] = param.trim().split(/\s+/)
                return { name, type }
              })
            : []

        classAPI.publicMethods.push({
          name: methodName,
          returnType: returnType,
          parameters: paramList,
        })
      }*/
      // console.log(classAPI)
      UIStore.update((s) => {
        s.api[c.name] = classAPI
      })
    })
  }

  /*function getInteractiveElements(): InteractiveElements {
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
  }*/
}
