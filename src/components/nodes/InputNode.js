import React from 'react';
import { Handle } from '@xyflow/react';

const InputNode = ({ data }) => {
  return (
    <div 
    style={{
        minWidth: data.nodeWidth,
        minHeight: data.nodeHeight,
      }}
      >
      {data.label}
      <Handle
        type="target"
        position="top"
        style={{
          width: '15px',
          height: '8px',
          background: '#555',
          borderRadius: 0,
        }}
      />
    </div>
  );
};

export default InputNode;
