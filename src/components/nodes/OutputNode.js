import React from 'react';
import { Handle } from '@xyflow/react';

const OutputNode = ({ data }) => {
  return (
    <div 
    style={{
        minWidth: data.nodeWidth,
        minHeight: data.nodeHeight,
      }}
      >
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
      {data.label}
    </div>
  );
};

export default OutputNode;
