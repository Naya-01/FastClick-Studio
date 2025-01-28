import React from 'react';
import { Box } from '@chakra-ui/react';

export const DragPanel = () => {
  return (
    <Box
      width="250px"
      bg="#f0f0f0"
      borderRight="1px solid #ccc"
      display="flex"
      flexDirection="column"
      alignItems="center"
      py="10px"
      zIndex="1000"
    >
      <Box
        draggable
        onDragStart={(event) => event.dataTransfer.setData('application/reactflow', 'NewNode')}
        style={{
          border: '1px dashed #ccc',
          padding: '10px',
          marginBottom: '10px',
          cursor: 'grab',
          backgroundColor: '#fff',
        }}
      >
        Drag Node
      </Box>
    </Box>
  );
};