import React, { useEffect } from 'react';
import { Handle, Position, useUpdateNodeInternals  } from '@xyflow/react';

const DynamicHandlesNode = ({ id, data }) => {
  const { label, inputs = 0, outputs = 0 } = data;
  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [inputs, outputs, id, updateNodeInternals]);

  const inputHandles = [];
  for (let i = 0; i < inputs; i++) {
    inputHandles.push(
      <Handle
        key={`input-handle-${i}`}
        type="target"
        id={`input-handle-${i}`}
        position={Position.Top}
        style={{
          width: '15px',
          height: '8px',
          background: '#555',
          borderRadius: 0,
          position: 'absolute',
          left: `${(i + 1) * (100 / (inputs + 1))}%`,
          transform: 'translateX(-50%)',
          top: '-10px',
        }}
      />
    );
  }

  const outputHandles = [];
  for (let i = 0; i < outputs; i++) {
    outputHandles.push(
      <Handle
        key={`output-handle-${i}`}
        type="source"
        id={`output-handle-${i}`}
        position={Position.Bottom}
        style={{
          width: '15px',
          height: '8px',
          background: '#555',
          borderRadius: 0,
          position: 'absolute',
          left: `${(i + 1) * (100 / (outputs + 1))}%`,
          transform: 'translateX(-50%)',
          bottom: '-10px',
        }}
      />
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {inputHandles}
      <div>{label}</div>
      {outputHandles}
    </div>
  );
};

export default DynamicHandlesNode;
