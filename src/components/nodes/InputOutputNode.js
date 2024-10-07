import React from 'react';
import { Handle } from '@xyflow/react';

const InputOutputNode = ({ data }) => {
  return (
    <div 
    style={{
        minWidth: data.nodeWidth,
        minHeight: data.nodeHeight,
      }}
      >

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
      {data.label}
      
      <Handle
        type="source"
        position="bottom"
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

export default InputOutputNode;
