import { projects } from '@/content/projects'
import { Project } from '@/data/types'
import { UIStore } from '@/store/UIStore'
import { useEffect, useState } from 'react'
import { FaIcon } from './FaIcon'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

export function Home() {
  const [local, setLocal] = useState<[string, Project][] | null>(null)

  useEffect(() => {
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith('purplej_project_'),
    )
    const locals: [string, Project][] = keys.map((key) => {
      return [key.split('_')[2], JSON.parse(localStorage.getItem(key)!)]
    })
    locals.sort((a, b) => b[1].lastUpdated - a[1].lastUpdated)

    setLocal(locals)
  }, [])

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
            anschaulicher Projekte. Wähle ein Beispiel:
          </p>
          <ul className="mt-3 list-disc list-inside">
            {Object.values(projects).map((p) =>
              renderLink(p, Math.random().toString().substring(2)),
            )}
          </ul>
          {local == null ? (
            <p className="mt-12">
              <FaIcon
                icon={faSpinner}
                className="w-5 h-5 animate-spin text-purple-700 "
              />
            </p>
          ) : (
            local.length > 0 && (
              <>
                <p className="mt-12">Deine Projekte:</p>
                <ul className="mt-3 list-disc list-inside">
                  {local.map(([key, p]) => renderLink(p, key, true))}
                </ul>
              </>
            )
          )}
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

  function renderLink(project: Project, id: string, showTs: boolean = false) {
    return (
      <li key={project.title}>
        <button
          className="text-purple-600 hover:underline cursor-pointer"
          onClick={() => {
            UIStore.update((s) => {
              s.dirtyClasses = project.classes.map((c) => c.name)
              s.openClass = null
              s.openClasses = []
              s.page = 'ide'
              s.projectId = id
              s.project = project
            })
          }}
        >
          {project.title}
          {showTs && <> [{new Date(project.lastUpdated).toLocaleString()}]</>}
        </button>
      </li>
    )
  }
}
