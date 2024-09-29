import { projects } from '@/content/projects'
import { Project } from '@/data/types'
import { useEffect, useState } from 'react'
import { Spinner } from './Spinner'
import { loadProject } from '@/actions/load-project'

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
            anschaulicher Projekte. Wähle eine Vorlage:
          </p>
          <div className="bg-purple-100 rounded-lg px-3 py-0.5 mt-6">
            {projects.map((p, i) => (
              <div
                key={i}
                className="my-4 bg-white py-2 px-3 rounded hover:bg-gray-100 cursor-pointer"
                tabIndex={0}
                onClick={() => {
                  loadProject(p)
                }}
              >
                <h2 className="font-bold">{p.title}</h2>
                <p className="mt-2 text-sm text-gray-700">{p.summary}</p>
              </div>
            ))}
          </div>
          {local == null ? (
            <p className="mt-12">
              <Spinner />
            </p>
          ) : (
            local.length > 0 && (
              <>
                <p className="mt-12">Deine Projekte:</p>
                <ul className="mt-3 list-disc list-inside">
                  {local.map(([key, p]) => renderLink(p, key))}
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

  function renderLink(project: Project, id: string) {
    return (
      <li key={project.title}>
        <button
          className="text-purple-600 hover:underline cursor-pointer"
          onClick={() => {
            loadProject(project, id)
          }}
        >
          {project.title}[{new Date(project.lastUpdated).toLocaleString()}]
        </button>
      </li>
    )
  }
}
