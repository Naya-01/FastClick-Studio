import React, { useCallback } from 'react';

export default function ContextMenu({
  id,
  type,
  top,
  left,
  right,
  bottom,
  nodes,
  setNodes,
  setEdges,
  setContextMenu,
  updateNodeHandles,
}) {
  const deleteElement = useCallback(() => {
    if (type === 'node') {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    } else if (type === 'edge') {
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
    }
    setContextMenu(null);
  }, [id, type, setNodes, setEdges, setContextMenu]);

  const addInputPort = () => {
    const node = nodes.find((n) => n.id === id);
    const newInputs = node.data.inputs + 1;
  
    updateNodeHandles(id, newInputs, node.data.outputs);
    setContextMenu(null);
  };
  
  const addOutputPort = () => {
    const node = nodes.find((n) => n.id === id);
    const newOutputs = node.data.outputs + 1;
  
    updateNodeHandles(id, node.data.inputs, newOutputs);
    setContextMenu(null);
  }
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left,
        right,
        bottom,
        backgroundColor: 'white',
        border: '1px solid #ccc',
        borderRadius: '4px',
        zIndex: 10,
        padding: '10px',
        boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <p style={{ marginBottom: '8px', fontSize: '12px', color: '#333' }}>
        {type === 'node' ? `Node: ${id}` : `Edge: ${id}`}
      </p>
      {type === 'node' && (
        <>
          <button onClick={addInputPort} style={{ display: 'block', margin: '5px 0' }}>
            Add Input Port
          </button>
          <button onClick={addOutputPort} style={{ display: 'block', margin: '5px 0' }}>
            Add Output Port
          </button>
        </>
      )}
      <button onClick={deleteElement} style={{ display: 'block', margin: '5px 0' }}>
        Delete
      </button>
    </div>
  );
}
