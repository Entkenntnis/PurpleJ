import { UIStore } from '@/store'
import clsx from 'clsx'
import Script from 'next/script'
import { useEffect, useRef } from 'react'

export function Runner() {
  const controllerState = UIStore.useState((s) => s.controllerState)
  const cheerpjUrl = UIStore.useState((s) => s.cheerpjUrl)
  const dirtyClasses = UIStore.useState((s) => s.dirtyClasses)
  const classes = UIStore.useState((s) => s.classes)
  const mainScript = UIStore.useState((s) => s.mainScript)
  const mainScriptDirty = UIStore.useState((s) => s.mainScriptDirty)
  const displayRef = useRef<HTMLDivElement>(null)
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
            })
            cheerpjCreateDisplay(-1, -1, displayRef.current)
            await cheerpjRunMain(
              'com.sun.tools.javac.Main',
              '/app/tools.jar',
              '-version',
            )
            UIStore.update((s) => {
              s.controllerState = 'compile-or-run'
              s.dirtyClasses = s.classes.map((c) => c.name)
            })
          }}
        />
      )}
      <div className="h-full flex flex-col">
        <div className="flex-grow-0 h-[200px] flex">
          <div className="flex-1 p-3 bg-yellow-50">
            {controllerState === 'loading' && (
              <p>Java-System wird geladen ...</p>
            )}
            {controllerState === 'compiling' && (
              <p>Klassen werden kompiliert ...</p>
            )}
            {controllerState === 'compile-or-run' && (
              <>
                {dirtyClasses.length > 0 || mainScriptDirty ? (
                  <p>
                    <button
                      className="px-2 py-0.5 bg-green-300 hover:bg-green-400 rounded"
                      onClick={async () => {
                        // This is the compile step
                        const encoder = new TextEncoder()
                        const sourceFiles = ['/str/SyntheticMain.java']

                        cheerpOSAddStringFile(
                          sourceFiles[0],
                          encoder.encode(`class SyntheticMain {
                            public static void main(String[] args) {
                              ${mainScript}
                            }
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
                        UIStore.update((s) => {
                          s.controllerState = 'compile-or-run'
                          s.dirtyClasses = []
                          s.mainScriptDirty = false
                        })
                      }}
                    >
                      {dirtyClasses.length == 0 ? (
                        'Hauptprogramm kompilieren'
                      ) : (
                        <>{dirtyClasses.length} Klassen kompilieren</>
                      )}
                    </button>
                  </p>
                ) : (
                  <>
                    <p>Bereit zum Ausführen</p>
                    <p>
                      <button
                        onClick={async () => {
                          document.getElementById('console')!.innerHTML = ''
                          cheerpjRunMain('SyntheticMain', '/files/')
                        }}
                        className="px-2 py-0.5 bg-green-300 hover:bg-green-400 rounded"
                      >
                        START
                      </button>
                    </p>
                  </>
                )}
              </>
            )}
          </div>
          <div className="flex-1 bg-purple-50">
            <p>HAUPTPROGRAMM SKRIPT (TEMPORÄR)</p>
            <textarea
              className="h-[150px] w-full mt-3"
              value={mainScript}
              onChange={(e) => {
                const text = e.target.value
                UIStore.update((s) => {
                  s.mainScript = text
                  s.mainScriptDirty = true
                })
              }}
            ></textarea>
          </div>
        </div>
        <div className="flex-grow bg-teal-50">
          <pre
            className="font-mono text-sm h-full overflow-auto"
            id="console"
          />
        </div>
        <div
          className={clsx(
            'h-[400px] flex-grow-0',
            controllerState !== 'compile-or-run' && 'opacity-0',
          )}
          ref={displayRef}
        ></div>
      </div>
    </>
  )
}
