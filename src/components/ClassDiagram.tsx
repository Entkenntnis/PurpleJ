import { UIStore } from '@/store'
import {
  Background,
  NodeResizeControl,
  ReactFlow,
  useEdgesState,
  useNodesState,
} from '@xyflow/react'

export function ClassDiagram() {
  const classes = UIStore.useState((s) => s.classes)

  const [nodes, , onNodesChange] = useNodesState(
    classes.map((c, i) => ({
      id: i.toString(),
      type: 'SingleClass',
      data: { label: c.name },
      position: { x: 50, y: 50 + i * 100 },
      style: {
        background: '#fff',
        border: '1px solid black',
        fontSize: 12,
      },
    })),
  )
  const [edges, , onEdgesChange] = useEdgesState([])

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={{ SingleClass }}
    >
      <Background />
    </ReactFlow>
  )
}

const SingleClass = ({ data }: { data: { label: string } }) => {
  return (
    <>
      <NodeResizeControl
        style={{ background: 'transparent', border: 'none' }}
        minWidth={100}
        minHeight={50}
      >
        <ResizeIcon />
      </NodeResizeControl>
      <div className="p-3 pr-6 pb-6">
        <p>{data.label}</p>
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
