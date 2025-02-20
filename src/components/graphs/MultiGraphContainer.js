import React, { useState } from 'react';
import { Box, Button, Heading, Text } from '@chakra-ui/react';
import ThroughputGraph from './ThroughputGraph';

const GraphType = {
  THROUGHPUT: 'THROUGHPUT',
};

const MultiGraphContainer = ({ selectedNode, handlers }) => {
  const [activeGraph, setActiveGraph] = useState(null);

  return (
    <Box display="flex" height="75vh">
      <Box width="20%" maxHeight="100%" overflowY="auto" mr={5} flexShrink={0}>
        {handlers.find(handler => handler.name.toLowerCase() === "count") && <Button 
          colorScheme="blue" 
          width="100%" 
          mb={3}
          onClick={() =>
            setActiveGraph(activeGraph === GraphType.THROUGHPUT ? null : GraphType.THROUGHPUT)
          }
        >
          {activeGraph === GraphType.THROUGHPUT ? "Hide Throughput" : "Show Throughput with count handler"}
        </Button>}
      </Box>

      <Box 
        flex="1" 
        p={6}
        border="1px solid"
        borderColor="gray.200"
        bg="gray.50"
        borderRadius="md"
        boxShadow="md"
        overflowY="auto"
      >
        {activeGraph === GraphType.THROUGHPUT && (
          <Box>
            <Heading size="md" mb={4}>Throughput Graph</Heading>
            <ThroughputGraph selectedNode={selectedNode} />
          </Box>
        )}
        {!activeGraph && (
          <Box display="flex" alignItems="center" justifyContent="center" height="100%">
            <Text fontSize="lg" color="gray.600">
              Select a graph to display it.
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default MultiGraphContainer;
