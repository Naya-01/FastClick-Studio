import React, { useCallback } from 'react';
import {
  Box,
  Text,
  Button,
  VStack,
  useColorModeValue,
} from '@chakra-ui/react';

export default function ContextMenu({
  id,
  type,
  top,
  left,
  right,
  bottom,
  nodes,
  setNodes,
  setEdges,
  setContextMenu,
  updateNodeHandles,
  onNodeClick
}) {
  const deleteElement = useCallback(() => {
    if (type === 'node') {
      setNodes((nds) => nds.filter((node) => node.id !== id));
      setEdges((eds) => eds.filter((edge) => edge.source !== id && edge.target !== id));
    } else if (type === 'edge') {
      setEdges((eds) => eds.filter((edge) => edge.id !== id));
    }
    setContextMenu(null);
  }, [id, type, setNodes, setEdges, setContextMenu]);

  const addInputPort = () => {
    const node = nodes.find((n) => n.id === id);
    const newInputs = node.data.inputs + 1;
  
    updateNodeHandles(id, newInputs, node.data.outputs);
    setContextMenu(null);
  };

  const addOutputPort = () => {
    const node = nodes.find((n) => n.id === id);
    const newOutputs = node.data.outputs + 1;
  
    updateNodeHandles(id, node.data.inputs, newOutputs);
    setContextMenu(null);
  };

  const handleDetailsClick = () => {
    onNodeClick(id);
    setContextMenu(null);
  };

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const buttonHoverStyles = (bgColor, textColor) => ({
    bg: bgColor,
    color: textColor,
    transform: 'translateY(-2px)',
    transition: 'all 0.2s ease-in-out'
  });

  return (
    <Box
      position="absolute"
      top={top}
      left={left}
      right={right}
      bottom={bottom}
      bg={bg}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="md"
      boxShadow="lg"
      p={3}
      zIndex={10}
      minWidth="200px"
      role="menu"
      aria-label="Context menu"
    >
      <Text fontSize="sm" color="gray.600" mb={2} fontWeight="medium">
        {type === 'node' ? `Node: ${id}` : `Edge: ${id}`}
      </Text>
      
      <VStack spacing={2} align="stretch">
        {type === 'node' && (
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleDetailsClick}
              _hover={buttonHoverStyles('purple.50', 'purple.600')}
              justifyContent="flex-start"
            >
              View Details
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={addInputPort}
              _hover={buttonHoverStyles('blue.50', 'blue.600')}
              justifyContent="flex-start"
            >
              Add Input Port
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={addOutputPort}
              _hover={buttonHoverStyles('blue.50', 'blue.600')}
              justifyContent="flex-start"
            >
              Add Output Port
            </Button>
          </>
        )}
        <Button
          size="sm"
          variant="ghost"
          onClick={deleteElement}
          _hover={buttonHoverStyles('red.50', 'red.600')}
          justifyContent="flex-start"
        >
          Delete
        </Button>
      </VStack>
    </Box>
  );
}
