'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

export default function Home() {
  const [state, setState] = useState(0)
  const [url, setUrl] = useState('')
  useEffect(() => {
    void (async () => {
      setUrl(
        (
          await (
            await fetch('https://cjrtnc.leaningtech.com/LATEST.txt')
          ).text()
        ).trim(),
      )
      setState(1)
    })()
  }, [])

  return (
    <>
      {url && (
        <Script
          src={url}
          onLoad={async () => {
            await window.cheerpjInit()
            setState(2)
          }}
        />
      )}
      {state == 0 && <div>...</div>}
      {state == 1 && <div>CheerpJ wird geladen</div>}
      {state == 2 && (
        <div>
          Schreibe dein Programm:
          <textarea
            className="w-full h-[300px] bg-yellow-50 p-3"
            id="code"
          ></textarea>
          <button
            onClick={async () => {
              const classPath = '/app/tools.jar:/files/'
              const sourceFiles = ['/str/Main.java']

              cheerpOSAddStringFile(
                '/str/Main.java',
                document.getElementById('code').value,
              )
              const code = await cheerpjRunMain(
                'com.sun.tools.javac.Main',
                classPath,
                ...sourceFiles,
                '-d',
                '/files/',
                '-Xlint',
              )
              console.log(code)
              cheerpjRunMain('Main', classPath)
            }}
          >
            Ausführen
          </button>
        </div>
      )}
      <pre className="font-mono text-sm min-h-3 border" id="console" />
    </>
  )
}
