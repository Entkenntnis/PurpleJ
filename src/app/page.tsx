'use client'

import { ClassDiagram } from '@/components/ClassDiagram'
import { UIStore } from '@/store'

export default function IDE() {
  const files = UIStore.useState((s) => s.files)
  return (
    <>
      <div className="h-full flex flex-col">
        <div className="h-12 bg-gray-50 flex-grow-0 flex-shrink-0 flex items-center justify-start gap-4 pl-4">
          <button className="px-2 py-0.5 bg-lime-200 rounded hover:bg-lime-300">
            Klassenübersicht
          </button>
          {files.map(({ name }, i) => (
            <button
              key={i}
              className="px-2 py-0.5 bg-gray-200 rounded hover:bg-gray-300"
            >
              {name}
            </button>
          ))}
        </div>
        <div className="flex-grow flex">
          <div className="flex-1 border-2 border-lime-300">
            <ClassDiagram />
          </div>
          <div className="bg-llime-300 flex-1">
            <ul>
              <li>Konsole</li>
              <li>Graphische Ausgabe</li>
              <li>Vorlage laden</li>
              <li>Neue Klasse einfügen</li>
              <li>Kompilieren</li>
              <li>CheerpJ Status</li>
              <li>Laufzeit starten</li>
              <li>Objekte erstellen</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  )
}
