import { Exercise } from '@/data/types'
import { UIStore } from '@/store/UIStore'

export function parseExercises() {
  const classes = UIStore.getRawState().project!.classes

  // Regex zum Finden von Klassen, die von __Exercise erben
  const classInheritanceRegex = /class\s+\w+\s+extends\s+PurpleJExercise/
  // Regex zum Finden des title-Attributs
  const titleRegex = /public\s+String\s+title\s*=\s*"([^"]*)"/
  // Regex zum Finden des description-Attributs
  const descriptionRegex = /public\s+String\s+description\s*=\s*"([^"]*)"/

  const exercises: Exercise[] = []

  classes.forEach((c) => {
    // Prüfe, ob die Klasse von __Exercise erbt
    if (classInheritanceRegex.test(c.content)) {
      // Extrahiere den title
      const titleMatch = c.content.match(titleRegex)
      if (titleMatch) {
        const descriptionMatch = c.content.match(descriptionRegex)
        if (descriptionMatch) {
          exercises.push({
            title: titleMatch[1],
            description: descriptionMatch[1],
            className: c.name,
            status: null,
          })
        }
      }
    }
  })
  exercises.sort((a, b) => a.title.localeCompare(b.title))
  UIStore.update((s) => {
    s.exercises = exercises
  })
}
