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
                  console.log(lib)*/
                  //const circle = await lib.Circle.getInstance()
                  //await circle.makeVisible()
                  // @ts-expect-error
                  window.lib = lib
                  runtime.current.lib = lib
                  prepareInteractiveMode()
                  UIStore.update((s) => {
                    s.inAction = false
                  })
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
        <div className="flex-grow flex overflow-auto">
          <div
            className={clsx(
              'flex-1 p-3 bg-yellow-50 overflow-auto',
              inAction && 'animate-pulse',
            )}
          >
            {controllerState === 'loading' && (
              <p className="animate-pulse">Java-System wird geladen ...</p>
            )}
            {controllerState === 'compiling' && (
              <p className="animate-pulse">Klassen werden kompiliert ...</p>
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

                            public static void test() {
                              System.out.println("Das ist eine Textnachricht");
                            }
                          }`),
                      )

                      cheerpOSAddStringFile(
                        `/str/Data/Hilfen.txt`,
                        encoder.encode(Hilfen),
                      )
                      cheerpOSAddStringFile(
                        `/str/Data/Anleitungstexte.txt`,
                        encoder.encode(Anleitungen),
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
                      const code = await cheerpjRunMain(
                        'com.sun.tools.javac.Main',
                        '/app/tools.jar:/files/',
                        ...sourceFiles,
                        '-d',
                        '/files/',
                        '-Xlint:-serial',
                      )
                      if (code !== 0) {
                        UIStore.update((s) => {
                          s.controllerState = 'compile-if-dirty'
                        })
                        return
                      }
                    }
                    UIStore.update((s) => {
                      s.controllerState = 'running'
                      s.dirtyClasses = []
                      s.instances = []
                      s.inAction = true
                      s.api = {}
                    })
                    document.getElementById('console')!.innerHTML = ''
                    runtime.current.heap = {}
                    await cheerpjRunMain('SyntheticMain', '/files/')
                    UIStore.update((s) => {
                      s.controllerState = 'compile-if-dirty'
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
                      className={clsx(
                        'm-1 px-1 py-0.5 bg-gray-200 rounded',
                        inAction ? 'cursor-default' : 'hover:bg-gray-300',
                      )}
                      onClick={() => {
                        if (!inAction) {
                          el.action()
                        }
                      }}
                    >
                      {el.code}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="h-[200px] bg-teal-50 overflow-auto">
          <pre className="font-mono text-sm h-full m-3" id="console" />
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

const Hilfen = `Erstelle zuerst eine neue Klasse und gib als Namen eine von dir gewählte
Heldenkategorie in Großbuchstaben an (z.B: ZWERG, DIEB, ...)
Wähle dann mit Rechtsklick Bearbeiten aus und lösche den gesamten Inhalt.
Schreibe nur folgenden Code hinein:

class DEINKLASSENNAME extends HELD{

}

Bearbeite jetzt die Arbeitsblatt Aufgabe 1!

Erstelle ab jetzt immer ein neues Objekt deines selbstgeschriebenen Heldens.
Dann wird dir die nächste Geschichte angezeigt.
#
Überlege dir sinnvolle Eigenschaften deines Heldens. 
 Möglichkeiten sind Name, Stärke, ... Wähle jeweils einen passenden Datentyp aus
 wie du sie bereits auf dem Arbeitsblatt aufgelistet hast.
#
Der Datentyp ist int und der Name muss genau so geschrieben sein: 'leben'.
#
Mögliche Methodennamen könnten z.B.: 'essen', 'warten', 'singen', 'neuerNameSetzen' usw. sein.
Du findest Ideen, wenn du überlegst, welche Attribute sich ändern könnten. Achte auf die richtigen Klammern.
#
Methodenname: 'heilen'. Statt einen Wert zu setzen, kannst du ihn mit folgenden Beispielen vergrößern/verkleinern.
x = x + 1;   x = x - 1;
#
Zum Überschreiben der Methode, kopiere einfach die Methode 'ducken' aus HELD in deine Klasse
und ändere sie so ab, dass die Rückgabe wahr ist.
#
Methoden mit Rückgabewerten haben zwei Kriterien:
Statt void steht dort ein beliebiger Datentyp und es kommt return vor.
#
Beachte, dass du beim Überschreiben die Methode genau gleich übernehmen musst.
Nur die Rückgabe (steht hinter return) solltest du zu dem Wort 'springen' ändern.
#
Deine Methode muss nach folgendem Pseudocode funktionieren:
  Wenn ( hindernis ist gleich 'Monster') dann
    Gib 'schleichen' zurück
  sonst
    Gib 'springen' zurück
  ende wenn
Wie du das programmierst, kannst du auch im Internet heraus finden.
#
Möglicher Pseudocode:
  Wenn ( hindernis ist gleich 'Monster') dann
    Gib 'schleichen' zurück
  sonst
    Wenn (hindernis ist gleich 'Tür') dann
      Gib 'öffnen' zurück
    sonst
      Gib 'springen' zurück
    ende wenn
  ende wenn
#
Ein Methodenaufruf ist immer eine Zeile der Form 'this.methodenname()'.
Wenn du beim Eingeben nach dem Punkt die Tastenkombination Strg+Leertaste drückst,
dann werden dir alle verfügbaren Methoden angezeigt.
Wähle die Methode zum Angreifen aus.
#
Für begegnungMit kannst du folgende Idee verwenden:
  Wenn (hindernis ist gleich 'Gegner') dann
    rufe Methode kaempfen auf
    gib 'Attacke!' zurück
  sonst
    --alles was vorher in der Methode stand--
  ende wenn`

const Anleitungen = `Willkommen in der Heldenvorbereitung. Hier steht immer, was du tun musst.
Als erstes wirst du einen eigenen Helden erschaffen.
Verwende die Hilfe, um dafür eine neue Unterklasse von HELD (z.B: KRIEGER, ZAUBERER, ...) 
zu erstellen.

Die Hilfetexte findest du so:
Klicke jetzt mit Rechtsklick auf das rote Objekt unter den Klassen und führe 
die Methode 'hilfe' mit dem Code 111 aus. Dort erfährst du wie es weitergeht.
#
Sehr gut. Als nächstes braucht deine neue Klasse einige Eigenschaften.
-> Bearbeite vom Aufgabenblatt die Nummer 2!
Ergänze danach mehrere Attribute in deiner Klasse und starte neu.
Die Hilfe befindet sich jetzt unter Rechtsklick "geerbt von HELD".
Falls du Hilfe brauchst verwende den Code: 112.
#
Prima. Ergänze zusätzlich ein ganzzahliges Attribut 'leben', damit du dort seine 
Lebenspunkte speichern kannst. (Hilfe unter 121)
#
Ohje! Einige seiner Werte sind noch auf 0!! Das muss schnell geändert werden.
-> Bearbeite zuerst vom Aufgabenblatt Aufgabe 4 (!!).
Ergänze nun auf die gleiche Art sinnvolle Startwerte für alle deine Attribute.
#
Dein Held sollte auch etwas machen können! Schreibe ihm dafür eine Methode.
Einfache Methoden haben immer den folgenden Aufbau:
void methodenname(){

}

(Hilfe unter 133)
#
Hmmm! Die Methode ist da, macht aber noch nichts.
-> Bearbeite jetzt Aufgabe 5 auf dem Blatt.
Ändere danach die Methode so, dass sie sinnvoll Attributwerte verändert!
#
Letzte Vorbereitung: Dein Held benötigt noch eine weitere Methode 'heilen'. 
Diese soll seine Lebenspunkte genau um 2 erhöhen. (Hilfe unter 143)
#
Jeah! Damit bist du bereit für den Dungeon!
Um den Dungeon zu betreten, zeige dein Heft mit Arbeitsblatt vorne der Lehrkraft.

Bonus für Schnelle: Schreibe eine Methode 'aufleveln', die alle Attribute verändert (und ggf. verbessert).
###
Ohje, dein Held ist voll gegen die Wand gelaufen. Das mit dem Ducken scheint noch nicht 
zu klappen. Woher kann er das überhaupt? Schau in die Oberklasse HELD und finde die 
Methode. Diese sollte auch erklären, warum das nicht klappt. Leider darfst du 
die Oberklasse nicht verändern.
 -> Bearbeite Aufgabenblatt Nummer 7!
Überschreibe danach die Methode in deiner Unterklasse und ändere ihren Rückgabewert, 
sodass er sich ducken kann. (Hilfe unter 241)
#
Dein Held ist so stolz, dass er es reingeschafft hat, dass er gleich etwas sagen muss.
Schreibe ihm eine Methode 'freuen' mit einem freudigen Text als Rückgabewert.
-> Bearbeite dann Aufgabenblatt Nummer 8. (Hilfe unter 244)
#
Mist. Jetzt steht dein Held vor dem Spalt und bewegt sich nicht weiter. So wird das nichts.
Schau wieder in die Klasse HELD. Hier findest du die Methode, die für die 'nichts'-Reaktion
verantwortlich ist. 
Überschreibe sie in deiner Unterklasse, sodass sie 'springen' zurück gibt.
(Hilfe unter 259)
#
Verflixt! Davon wurde das Monster wach. Dein Held hatte keine Chance...
An diesem Ungetüm kann man sich nur vorbei schleichen. Doch was passiert wenn du einfach
'schleichen' statt 'springen' zurück gibst? Wenn du dir nicht sicher bist, probiere es aus!
#
Schau dir die Methode 'begegnungMit' genau an. Worin unterscheidet sie sich von den anderen?
-> Bearbeite jetzt Aufgabenblatt Nummer 9.
Der Parameter 'hindernis' sollte dir helfen. Lass dir als erstes seine Werte anzeigen, 
indem du die folgende Zeile über 'return' abschreibst und neu startest:
  System.out.println("Schau HIER: " + hindernis);

Starte neu! Siehst du oben die neuen Ausgaben? Der Parameter ist wirklich jedes mal anders.
-> Bearbeite auch noch Aufgabenblatt Nummer 10.
Schreibe dann eine Bedingung, sodass der Held schleicht, wenn er auf das Monster trifft 
und sonst immer springt. (Hilfe unter 263)
#
Du musst die Methode 'begegnungMit' nochmal umbauen. Finde eine Möglichkeit,
sodass dein Held alle Hindernisse überwindet. (Hilfe unter 276)
#
Super. Du bist erfolgreich durch die Gänge des DUNGEON gelaufen.
Im dritten Teil erfährst du, was sich hinter der Tür befindet.
Verwende für deine Heldenklasse in BlueJ auch den Menüpunkt "Bearbeiten > Auto-Layout".
Zeige dann dein Heft mit den Lösungen wieder vorne am Lehrerpult.

Bonus (FEHLT): Um das große Finale zu erreichen, erwartet dich noch ein ganzes Dungeonlabyrinth.
###
Leider hat dein Held keine Ahnung, was er jetzt tun soll. So wird das nichts.
Schreibe als erstes eine Methode 'kaempfen' (ohne Parameter oder Rückgabewert).
 -> Bearbeite jetzt Aufgabenblatt Nummer 12. (!)
Dein Held weiß sogar bereits wie man angreift. Eine passende Methode wurde in 
der Klasse HELD bereits programmiert. Um diese Methode im Kampf zu benutzen, 
rufe die passende Methode der Oberklasse in deiner neuen Methode 'kaempfen' auf. 
(Hilfe unter 309)
#
Deine Methode 'kaempfen' ist vorhanden. Jedoch macht sie noch nicht das richtige.
Schreibe sie so, dass sie die andere Methode zum angreifen aus der Oberklasse
aufruft. (Hilfe unter 309)
#
Und so hat der kleine Gnom deinen Helden besiegt. Das ging schnell. :-(
Dein Held weiß noch nicht, wann er seine Methode 'kaempfen' verwenden soll.
Baue also die Methode 'begegnungMit' so um, dass du bei einem *Gegner* zuerst deine neue
Methode 'kaempfen' aufrufst und als Rückgabe danach 'Attacke!' zurück gibst.
(Hilfe unter 333)
#
Prima! Du musst ab jetzt die Methode 'begegnungMit' nicht mehr ändern!
Dein Held musste aber auch bisschen was einstecken. Schau mal nach seinen Leben:
Klicke mit Rechtsklick auf das rote Helden-Objekt, dann auf 'Inspizieren'. 
Hier solltest du die Attributwerte sehen.
Füge in der Methode 'kaempfen' nach deinem Angriff noch einen Methodenaufruf 
von 'heilen' ein, damit es ihm etwas besser geht.
#
Beachte, dass dein Held sich nur 1x pro Kampfrunde heilen darf!!!
Er sollte jetzt eigentlich genau 82 Lebenspunkte haben.
#
OHA! Der ist viel krasser! Schau mal nach deinen Lebenspunkten!
Nach nur wenigen Kampfrunden ist dein Held ohnmächtig zusammengeklappt.
Du musst schneller angreifen! Schreibe die Methode so um, dass du jedes mal 5x angreifst, 
indem du einfach mehrere Methodenaufrufe schreibst. 
Beachte, dass du dich nur einmal heilen darfst.
#
WUUMMS! Jova hat deinen Helden mit seiner riesigen Keule zu Pfannkuchenmatsche zerschlagen.
Irgendwie muss dein Held überirdisch schnell angreifen...
-> Bearbeite Aufgabenblatt Nummer 13.
Löse das Problem mit dem Endgegner, indem du pro Kampfrunde mindestens 100 Angriffe machst.`
