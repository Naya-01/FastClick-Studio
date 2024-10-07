import React from 'react';
import { Handle } from '@xyflow/react';

const OutputNode = ({ data }) => {
  return (
    <div>
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

export default OutputNode;
