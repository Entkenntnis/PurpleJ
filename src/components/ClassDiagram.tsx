import { IUIStore } from '@/data/types'
import { UIStore } from '@/store'
import {
  Background,
  NodeResizeControl,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import clsx from 'clsx'
import { useCallback, useEffect } from 'react'

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
        <ResizeIcon />
      </NodeResizeControl>
      <div className="">
        <p
          className={clsx(
            'border-b text-center pt-1 pb-1 border-black',
            data.dirty && 'bg-orange-500',
          )}
        >
          {data.label}
        </p>
        <div className={clsx('pl-2 pt-1 pb-6 pr-6')}>
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
        </div>
      </div>
    </>
  )
}

function ResizeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="#ff0071"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ position: 'absolute', right: 5, bottom: 5 }}
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
      <polyline points="16 20 20 20 20 16" />
      <line x1="14" y1="14" x2="20" y2="20" />
      <polyline points="8 4 4 4 4 8" />
      <line x1="4" y1="4" x2="10" y2="10" />
    </svg>
  )
}
