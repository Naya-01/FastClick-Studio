import React, { memo } from 'react';
import { getBezierPath, BaseEdge, EdgeLabelRenderer} from '@xyflow/react';
import { Box, Button } from '@chakra-ui/react';

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
  const [edgePath, labelX, labelY] = getBezierPath({
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
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      {data?.showAdd && data?.onAddCounter &&
      <EdgeLabelRenderer>
        <Box
          position="absolute"
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'auto',
          }}
          zIndex={2000}
        >
          <Button onClick={handleClick} size="sm" colorScheme="red">
            +
          </Button>
        </Box>
      </EdgeLabelRenderer>}
    </>
  );
};

export default memo(ProposalEdge);
