import { UIStore } from '@/store/UIStore'
import { useJavaRuntime } from './JavaRuntime'
import clsx from 'clsx'
import { FaIcon } from './FaIcon'
import { faPlay } from '@fortawesome/free-solid-svg-icons'
import { Spinner } from './Spinner'
import { saveProject } from '@/actions/save-project'

export function ObjectBench() {
  const controllerState = UIStore.useState((s) => s.controllerState)
  const dirtyClasses = UIStore.useState((s) => s.dirtyClasses)
  const inAction = UIStore.useState((s) => s.inAction)
  const syntheticMainCompiled = UIStore.useState((s) => s.syntheticMainCompiled)

  const runtime = useJavaRuntime()

  return (
    <div className={clsx('h-full overflow-auto', inAction && 'cursor-wait')}>
      {controllerState === 'loading' && (
        <div className="flex justify-center items-center h-full">
          <p className="italic text-gray-600 pb-6 animate-pulse">
            Java-System wird geladen ...
          </p>
        </div>
      )}
      {controllerState === 'compiling' && (
        <div className="flex justify-center items-center h-full">
          <p className="text-purple-600 pb-6">
            <Spinner />
            Klassen werden kompiliert ... einen kleinen Moment Geduld 🙏
          </p>
        </div>
      )}
      {controllerState === 'compile-if-dirty' && (
        <div className="flex justify-center items-center h-full">
          <p className="pb-2">
            <button
              className="px-3 py-2 bg-purple-400 hover:bg-purple-500 rounded"
              onClick={async () => {
                saveProject()

                if (dirtyClasses.length > 0 || !syntheticMainCompiled) {
                  await runtime.getRuntime().compile()
                }
                runtime.getRuntime().run()
              }}
            >
              <FaIcon icon={faPlay} className="mr-3" />
              {dirtyClasses.length == 0 && syntheticMainCompiled ? (
                <>Interaktiven Modus starten</>
              ) : (
                <>Kompilieren und interaktiven Modus starten</>
              )}
            </button>
          </p>
        </div>
      )}
      {controllerState === 'running' && (
        <div>
          <div className="mt-3 flex flex-wrap justify-start">
            {runtime
              .getRuntime()
              .getInteractiveElements()
              .map((el, i) => (
                <button
                  key={i}
                  className={clsx(
                    'm-1 px-1 py-0.5 bg-gray-200 rounded',
                    inAction ? 'cursor-wait' : 'hover:bg-gray-300',
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
  )
}
