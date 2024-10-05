import { Class } from '@/data/types'
import { UIStore } from '@/store/UIStore'
import {
  Background,
  Edge,
  Handle,
  MarkerType,
  Position,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'
import clsx from 'clsx'
import { useCallback, useEffect } from 'react'
import { FaIcon } from './FaIcon'
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons'
import { AstNode, cursorToAstNode } from '@/lang/astNode'
import { parser } from '@lezer/java'
import { Text } from '@codemirror/state'

const proOptions = { hideAttribution: true }

export function ClassDiagram() {
  const classes = UIStore.useState((s) => s.project!.classes)
  const dirtyClasses = UIStore.useState((s) => s.dirtyClasses)

  const classToNode = useCallback(
    (c: Class) => {
      return {
        id: c.name,
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
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  useEffect(() => {
    setNodes(classes.map(classToNode))
    // extract stuff from classes
    const edges: Edge[] = []
    for (const c of classes) {
      // find assoziations
      const tree = parser.parse(c.content)
      const t = cursorToAstNode(tree.cursor(), Text.of(c.content.split('\n')))
      const refs: string[] = []
      const scan = (t: AstNode) => {
        if (t.name == 'TypeName') {
          refs.push(t.text())
        }
        if (t.name == 'Identifier') {
          refs.push(t.text())
        }
        t.children.forEach(scan)
      }
      scan(t)
      for (const c2 of classes) {
        if (c2.name != c.name) {
          if (refs.includes(c2.name)) {
            edges.push({
              id: `${c2.name}-->${c.name}`,
              target: c2.name,
              source: c.name,
              style: { strokeDasharray: '4 4' },
              markerEnd: { type: MarkerType.Arrow, height: 17, width: 17 },
            })
          }
        }
      }
    }
    setEdges(edges)
  }, [classToNode, classes, dirtyClasses, setEdges, setNodes])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={(e) => {
        for (const event of e) {
          if (event.type == 'position' && !event.dragging) {
            UIStore.update((s) => {
              s.project!.classes.find((c) => c.name === event.id)!.position =
                event.position!
            })
          }
        }
        onNodesChange(e)
      }}
      onEdgesChange={onEdgesChange}
      nodeTypes={{ SingleClass }}
      proOptions={proOptions}
      minZoom={0.5}
      maxZoom={1}
      fitView={true}
    >
      <Background />
    </ReactFlow>
  )
}

const SingleClass = ({
  data,
}: {
  data: { label: string; dirty: boolean }
  id: string
}) => {
  return (
    <>
      <Handle type="target" position={Position.Left} className="opacity-0" />
      <Handle type="source" position={Position.Right} className="opacity-0" />
      {/*<NodeResizeControl
        style={{ background: 'transparent', border: 'none' }}
        onResizeEnd={(e) => {
          UIStore.update((s) => {
            const c = s.project!.classes.find((_, i) => i.toString() === id)!
            if (!c?.size) {
              c.size = { width: 0, height: 0 }
            }
            c.size.width = e.x
            c.size.height = e.y
          })
        }}
        minWidth={140}
        minHeight={60}
      >
        <FaIcon
          icon={faUpRightAndDownLeftFromCenter}
          className="-scale-x-100 absolute right-1 bottom-1"
        />
      </NodeResizeControl>*/}
      <div className="h-full flex flex-col">
        <p
          className={clsx(
            'border-b text-center pt-1 pb-1 border-black font-bold',
          )}
        >
          {data.label}
        </p>
        <div
          className={clsx('p-3 flex-grow')}
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
            className="bg-gray-100 hover:bg-green-200 w-14 h-14 rounded"
            onClick={() => {
              UIStore.update((s) => {
                if (!s.openClasses.includes(data.label)) {
                  s.openClasses.push(data.label)
                }
                s.openClass = data.label
              })
            }}
          >
            <FaIcon icon={faPencil} />
          </button>
          <button
            className="bg-gray-100 hover:bg-red-200 w-7 h-7 rounded ml-3"
            onClick={() => {
              const result = confirm('Klasse wirklich löschen?')
              if (result) {
                UIStore.update((s) => {
                  s.project!.classes = s.project!.classes.filter(
                    (el) => el.name !== data.label,
                  )
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
            <FaIcon icon={faTrash} />
          </button>
        </div>
      </div>
    </>
  )
}
