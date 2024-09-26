import { UIStore } from '@/store/UIStore'
import { VMStore } from '@/store/VMStore'
import { useJavaRuntime } from './JavaRuntime'
import clsx from 'clsx'

export function ObjectBench() {
  const controllerState = VMStore.useState((s) => s.controllerState)
  const dirtyClasses = UIStore.useState((s) => s.dirtyClasses)
  const inAction = UIStore.useState((s) => s.inAction)

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
            <svg
              aria-hidden="true"
              className="w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-purple-700 inline-block mb-1 mr-3"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            Klassen werden kompiliert ... habe einen kleinen Moment Geduld 🙏
          </p>
        </div>
      )}
      {controllerState === 'compile-if-dirty' && (
        <div className="flex justify-center items-center h-full">
          <p className="pb-4">
            <button
              className="px-2 py-0.5 bg-purple-300 hover:bg-purple-400 rounded"
              onClick={async () => {
                runtime.getRuntime().compileAndRun()
              }}
            >
              {dirtyClasses.length == 0 ? (
                <>Interaktiven Modus starten</>
              ) : (
                <>Kompileren und interaktiven Modus starten</>
              )}
            </button>
          </p>
        </div>
      )}
      {controllerState === 'running' && (
        <div>
          <p>
            VM gestartet
            <button
              onClick={() => {
                runtime.getRuntime().exit()
              }}
              className="ml-6 px-2 py-0.5 bg-red-300 hover:bg-red-400 rounded"
            >
              VM zurücksetzen
            </button>
          </p>
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
