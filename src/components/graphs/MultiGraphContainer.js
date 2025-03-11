import React, { useState, useCallback } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import ThroughputGraph from './ThroughputGraph';
import CyclesGraph from './CyclesGraph';
import CustomGraph from './CustomGraph';

const GraphType = {
  THROUGHPUT: 'THROUGHPUT',
  CYCLES: 'CYCLES',
  CUSTOM: 'CUSTOM',
};

const MultiGraphContainer = ({ selectedNode, handlers }) => {
  const [activeGraph, setActiveGraph] = useState(null);

  const countHandler = handlers.find(handler => handler.name.toLowerCase() === "count");
  const cyclesHandler = handlers.find(handler => handler.name.toLowerCase() === "cycles");

  const toggleGraph = useCallback((graphType) => {
    setActiveGraph(prev => (prev === graphType ? null : graphType));
  }, []);

  return (
    <Box display="flex" height="75vh">
      <Box width="20%" maxHeight="100%" overflowY="auto" mr={5} flexShrink={0}>
      {countHandler && <Button 
          colorScheme="blue" 
          width="100%" 
          mb={3}
          onClick={() => toggleGraph(GraphType.THROUGHPUT)}
        >
          {activeGraph === GraphType.THROUGHPUT ? "Hide Throughput" : "Show Throughput Graph"}
        </Button>}
        {cyclesHandler && (
          <Button 
            colorScheme="purple" 
            width="100%" 
            mb={3}
            onClick={() => toggleGraph(GraphType.CYCLES)}
          >
            {activeGraph === GraphType.CYCLES ? "Hide Cycles" : "Show Cycles Graph"}
          </Button>
        )}
        <Button
          colorScheme="teal"
          width="100%"
          mb={3}
          onClick={() => toggleGraph(GraphType.CUSTOM)}
        >
          {activeGraph === GraphType.CUSTOM ? "Hide Custom Graph" : "Show Custom Graph"}
        </Button>
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
            <ThroughputGraph selectedNode={selectedNode} />
          </Box>
        )}
        {activeGraph === GraphType.CYCLES && (
          <Box>
            <CyclesGraph selectedNode={selectedNode} />
          </Box>
        )}
        {activeGraph === GraphType.CUSTOM && (
          <CustomGraph selectedNode={selectedNode} availableHandlers={handlers} title="Custom Graph" />
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

export default React.memo(MultiGraphContainer);
