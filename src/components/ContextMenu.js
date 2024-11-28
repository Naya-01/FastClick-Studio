import React, { useCallback } from 'react';

export default function ContextMenu({ id, type, top, left, right, bottom, setNodes, setEdges, setContextMenu }) {
  const deleteElement = useCallback(() => {
    if (type === 'node') {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    } else if (type === 'edge') {
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
    }
    setContextMenu(null);
  }, [id, type, setNodes, setEdges, setContextMenu]);

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
      <button onClick={deleteElement}>Delete</button>
    </div>
  );
}
