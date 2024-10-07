import React from 'react';
import { Handle } from '@xyflow/react';

const InputNode = ({ data }) => {
  return (
    <div>
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

export default InputNode;
