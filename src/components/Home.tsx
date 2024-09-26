import { dungeon } from '@/content/dungeon'
import { figures } from '@/content/figures'
import { IUIStore } from '@/data/types'
import { UIStore } from '@/store'

export function Home() {
  return (
    <>
      <div>
        <div className="flex justify-center">
          <h1 className="mt-5 text-3xl px-4 py-3 bg-purple-700 rounded-xl text-white">
            PurpleJ
          </h1>
        </div>
        <div className="max-w-[600px] p-3 mx-auto mt-9">
          <p>
            Irgendwann wird dein Programm länger, passt nicht mehr ganz auf den
            Bildschirm. Du brauchst eine Struktur, um dich nicht zu verlieren.
          </p>
          <p className="mt-3">
            Die objekt-orientierte Programmierung (OOP) bietet dir eine Lösung.
            Sie ist nicht perfekt, oh nein, aber ihre Grundideen geben dir einen
            guten Rahmen.
          </p>
          <p className="mt-3">
            Du findest hier eine Einführung in die OOP mit der Sprache Java.
            Diese Sprache wurde ausgewählt, weil sie am klarsten die
            Objektoriertierung umsetzt. Wenn du die Prinzipien in Java
            verstanden hast, lassen sich diese leicht auf andere Sprachen wie
            Python oder C++ übertragen.
          </p>
          <p className="mt-3">Steige ein mit einem dieser Projekte:</p>
          <ul className="mt-3 list-disc list-inside">
            {renderLink('Figuren (übernommen von BlueJ)', figures)}
            {renderLink('Helden-Abenteuer (WIP)', dungeon)}
          </ul>
          <p className="mt-[200px]">
            Das Projekt wird ermöglicht durch Technologie von{' '}
            <a
              href="https://cheerpj.com/"
              target="_blank"
              className="text-blue-600 hover:underline cursor-pointer"
            >
              CheerpJ
            </a>
            .
          </p>
          <img
            src="/CheerpJ_White_Horizontal_Trans-300x81.png.webp"
            alt="CheerpJ Logo"
            className="bg-gray-700 px-3 py-3 h-[60px] mt-3"
          />
        </div>
      </div>
    </>
  )

  function renderLink(name: string, classes: IUIStore['classes']) {
    return (
      <li
        className="text-purple-600 hover:underline cursor-pointer"
        onClick={() => {
          UIStore.update((s) => {
            s.classes = classes
            s.controllerState = 'loading'
            s.dirtyClasses = classes.map((c) => c.name)
            s.openClass = null
            s.openClasses = []
            s.page = 'ide'
          })
        }}
      >
        {name}
      </li>
    )
  }
}
