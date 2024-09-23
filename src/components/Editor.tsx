import { UIStore } from '@/store'
import { EditorView, basicSetup } from 'codemirror'
import { keymap } from '@codemirror/view'
import { indentWithTab } from '@codemirror/commands'
import { java } from '@codemirror/lang-java'
import { indentUnit } from '@codemirror/language'
import { useEffect, useRef } from 'react'
import { EditorState } from '@codemirror/state'

export function Editor() {
  const editorDiv = useRef(null)
  const openClass = UIStore.useState((s) => s.openClass)
  const classes = UIStore.useState((s) => s.classes)

  useEffect(() => {
    if (editorDiv.current) {
      const editor = new EditorView({
        state: EditorState.create({
          doc: classes.find((c) => c.name == openClass)?.content,
          extensions: [
            basicSetup,
            keymap.of([indentWithTab]),
            indentUnit.of('    '),
            java(),
            EditorView.updateListener.of((e) => {
              if (e.docChanged) {
                UIStore.update((s) => {
                  s.classes.find((c) => c.name == openClass)!.content =
                    editor.state.doc.toString()
                  if (!s.dirtyClasses.includes(openClass!)) {
                    s.dirtyClasses.push(openClass!)
                  }
                })
              }
            }),
          ],
        }),
        parent: editorDiv.current,
      })
      return () => {
        editor.destroy()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openClass])

  return (
    <div ref={editorDiv} className="max-h-[calc(100vh-52px)] overflow-auto" />
  )
}
