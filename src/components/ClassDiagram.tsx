import { IUIStore } from '@/data/types'
import { UIStore } from '@/store/UIStore'
import {
  Background,
  NodeResizeControl,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import clsx from 'clsx'
import { useCallback, useEffect } from 'react'
import { FaIcon } from './FaIcon'
import { faUpRightAndDownLeftFromCenter } from '@fortawesome/free-solid-svg-icons'

const proOptions = { hideAttribution: true }

export function ClassDiagram() {
  const classes = UIStore.useState((s) => s.classes)
  const dirtyClasses = UIStore.useState((s) => s.dirtyClasses)

  const classToNode = useCallback(
    (c: IUIStore['classes'][number], i: number) => {
      return {
        id: i.toString(),
        type: 'SingleClass',
        data: { label: c.name, dirty: dirtyClasses.includes(c.name) },
        position: { x: c.position.x, y: c.position.y },
        style: {
          background: '#fff',
          border: '1px solid black',
          fontSize: 14,
          ...(c.size ?? {}),
        },
      }
    },
    [dirtyClasses],
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(
    classes.map(classToNode),
  )
  const [edges, , onEdgesChange] = useEdgesState([])

  useEffect(() => {
    setNodes(classes.map(classToNode))
  }, [classToNode, classes, dirtyClasses, setNodes])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={(e) => {
        for (const event of e) {
          if (event.type == 'position' && !event.dragging) {
            UIStore.update((s) => {
              s.classes.find((_, i) => i.toString() === event.id)!.position =
                event.position!
            })
          }
        }
        onNodesChange(e)
      }}
      onEdgesChange={onEdgesChange}
      nodeTypes={{ SingleClass }}
      proOptions={proOptions}
    >
      <Background />
    </ReactFlow>
  )
}

const SingleClass = ({
  data,
  id,
}: {
  data: { label: string; dirty: boolean }
  id: string
}) => {
  return (
    <>
      <NodeResizeControl
        style={{ background: 'transparent', border: 'none' }}
        onResizeEnd={(e) => {
          UIStore.update((s) => {
            const c = s.classes.find((_, i) => i.toString() === id)!
            if (!c?.size) {
              c.size = { width: 0, height: 0 }
            }
            c.size.width = e.x
            c.size.height = e.y
          })
        }}
        minWidth={100}
        minHeight={50}
      >
        <FaIcon
          icon={faUpRightAndDownLeftFromCenter}
          className="-scale-x-100 absolute right-1 bottom-1"
        />
      </NodeResizeControl>
      <div className="h-full flex flex-col">
        <p
          className={clsx(
            'border-b text-center pt-1 pb-1 border-black font-bold',
          )}
        >
          {data.label}
        </p>
        <div
          className={clsx('pl-2 pt-1 pb-6 pr-6 flex-grow')}
          style={
            data.dirty
              ? {
                  background: `repeating-linear-gradient(
            45deg,
            #e9d5ff,
            #e9d5ff 10px,
            #c4b5fd 10px,
            #c4b5fd 20px
          )`,
                }
              : {}
          }
        >
          <button
            className="underline"
            onClick={() => {
              UIStore.update((s) => {
                if (!s.openClasses.includes(data.label)) {
                  s.openClasses.push(data.label)
                }
                s.openClass = data.label
              })
            }}
          >
            Bearbeiten
          </button>
          <br />
          <button
            className="underline"
            onClick={() => {
              const result = confirm('Klasse wirklich löschen?')
              if (result) {
                UIStore.update((s) => {
                  s.classes = s.classes.filter((el) => el.name !== data.label)
                  s.openClasses = s.openClasses.filter(
                    (el) => el !== data.label,
                  )
                  s.dirtyClasses = s.dirtyClasses.filter(
                    (el) => el !== data.label,
                  )
                })
              }
            }}
          >
            Entfernen
          </button>
        </div>
      </div>
    </>
  )
}
