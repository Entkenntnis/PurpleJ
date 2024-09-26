import { Project } from '@/data/types'
import { figures } from './figures'
import { dungeon } from './dungeon'

export const projects: { [key: string]: Project } = {
  1: figures,
  2: dungeon,
}
