import React, { useEffect, useMemo } from 'react';
import { Handle, Position, useUpdateNodeInternals  } from '@xyflow/react';

const DynamicHandlesNode = ({ id, data, sourcePosition, targetPosition }) => {
  const { label, inputs = 0, outputs = 0 } = data;
  const updateNodeInternals = useUpdateNodeInternals();

  const isHorizontal = sourcePosition === 'right' || targetPosition === 'left';

  useEffect(() => {
    updateNodeInternals(id);
  }, [inputs, outputs, id, updateNodeInternals]);

  const inputHandles = useMemo(() => {
    const handles = [];
    for (let i = 0; i < inputs; i++) {
      handles.push(
        <Handle
          key={`input-handle-${i}`}
          type="target"
          id={`input-handle-${i}`}
          position={(isHorizontal ? targetPosition : Position.Top)}
          style={{
            width: '15px',
            height: '8px',
            background: '#555',
            borderRadius: 0,
            position: 'absolute',
            ...(isHorizontal ? {
              ...(targetPosition === 'left' || targetPosition === 'right'
                ? {
                    top: `${(i + 1) * (100 / (inputs + 1))}%`,
                    transform: 'translateY(-50%)',
                  }
                : {
                    right: `${(i + 1) * (100 / (inputs + 1))}%`,
                    transform: 'translateX(-50%)',
                  }),
            }
            :
            {
              left: `${(i + 1) * (100 / (inputs + 1))}%`,
              transform: 'translateX(-50%)',
              top: '-10px',
            }
          ),
          }}
      />
      );
    }
    return handles;
  }, [inputs, isHorizontal, targetPosition]);

  const outputHandles = useMemo(() => {
    const handles = [];
    for (let i = 0; i < outputs; i++) {
      handles.push(
        <Handle
          key={`output-handle-${i}`}
          type="source"
          id={`output-handle-${i}`}
          position={(isHorizontal ? sourcePosition : Position.Bottom)}
          style={{
            width: '15px',
            height: '8px',
            background: '#555',
            borderRadius: 0,
            position: 'absolute',
            ...(isHorizontal ? {
              ...(sourcePosition === 'left' || sourcePosition === 'right'
                ? {
                    top: `${(i + 1) * (100 / (outputs + 1))}%`,
                    transform: 'translateY(-50%)',
                  }
                : {
                    left: `${(i + 1) * (100 / (outputs + 1))}%`,
                    transform: 'translateX(-50%)',
                  }),
            }
            :
            {
              left: `${(i + 1) * (100 / (outputs + 1))}%`,
              transform: 'translateX(-50%)',
              bottom: '-10px',
            }
          )
          }}
      />
      );
    }
    return handles;
  }, [outputs, isHorizontal, sourcePosition]);

  return (
    <div style={{ position: 'relative' }}>
      {inputHandles}
      <div>{label}</div>
      {outputHandles}
    </div>
  );
};

export default React.memo(DynamicHandlesNode);
