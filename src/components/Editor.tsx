import { UIStore } from '@/store'

export function Editor() {
  const openClass = UIStore.useState((s) => s.openClass)
  const classes = UIStore.useState((s) => s.classes)
  return (
    <textarea
      key={openClass}
      className="w-full h-full font-mono"
      defaultValue={classes.find((c) => c.name == openClass)?.content}
      onChange={(e) => {
        const content = e.target.value
        UIStore.update((s) => {
          s.classes.find((c) => c.name == openClass)!.content = content
          if (!s.dirtyClasses.includes(openClass!)) {
            s.dirtyClasses.push(openClass!)
          }
        })
      }}
    ></textarea>
  )
}
