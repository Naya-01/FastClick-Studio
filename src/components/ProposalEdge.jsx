
import React, { useEffect, useMemo } from 'react';
import { getSmoothStepPath } from '@xyflow/react';
import { Box } from '@chakra-ui/react';

const ProposalEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  data,
  style,
}) => {
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  });

  const handleClick = () => {
    if (data?.onAddCounter) {
      data.onAddCounter(id);
    }
  };

  return (
    <g>
      <path
        id={id}
        d={edgePath}
        markerEnd={markerEnd}
        className="react-flow__edge-path"
        style={style}
      />
      {data?.showAdd && data?.onAddCounter && (
        <foreignObject x={labelX - 15} y={labelY - 15} width="30" height="30">
          <Box
            as="button"
            width="30px"
            height="27px"
            borderRadius="full"
            bg="#ff0066"
            display="flex"
            alignItems="center"
            justifyContent="center"
            color="white"
            fontWeight="bold"
            onClick={handleClick}
            _hover={{ bg: "#e6005c" }}
            style={{ border: 'none', cursor: 'pointer' }}
          >
            +
          </Box>
        </foreignObject>
      )}
    </g>
  );
};

export default React.memo(ProposalEdge);
