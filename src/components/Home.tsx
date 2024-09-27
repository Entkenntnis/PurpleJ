import { projects } from '@/content/projects'
import { Project } from '@/data/types'
import { UIStore } from '@/store/UIStore'

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
            Entdecke die objekt-orientiere Programmierung mit Java anhand
            anschaulicher Projekte. Starte mit einem Beispiel:
          </p>
          <ul className="mt-3 list-disc list-inside">
            {Object.entries(projects).map(renderLink)}
          </ul>
          <p className="mt-12">Lokaler Zwischenspeicher:</p>
          <ul className="mt-3">
            <li>Element 1</li>
          </ul>
          <p className="mt-3">
            <input type="checkbox" /> automatisch lokal speichern
          </p>
          <p className="mt-20">Projekt aus Datei laden:</p>
          <p className="my-3">
            <input type="file" className="bg-gray-50 p-2 rounded" />
          </p>
          <p>
            <button className="px-2 py-0.5 bg-purple-200 hover:bg-purple-300 rounded">
              Öffnen
            </button>{' '}
            <button className="ml-10 px-2 py-0.5 bg-pink-200 hover:bg-pink-300 rounded">
              Im Editor bearbeiten
            </button>
          </p>
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

  function renderLink([id, project]: [string, Project]) {
    return (
      <li key={project.title}>
        <button
          className="text-purple-600 hover:underline cursor-pointer"
          onClick={() => {
            UIStore.update((s) => {
              s.classes = project.classes
              s.dirtyClasses = project.classes.map((c) => c.name)
              s.openClass = null
              s.openClasses = []
              s.page = 'ide'
              s.output = project.output
              s.projectId = parseInt(id)
            })
          }}
        >
          {project.title}
        </button>
      </li>
    )
  }
}
