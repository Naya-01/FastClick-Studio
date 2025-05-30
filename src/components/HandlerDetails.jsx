import React, { useState, useEffect } from 'react';
import {
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Text,
  useColorModeValue,
  Input,
} from '@chakra-ui/react';
import { WebsocketService } from '../services/webSocketService';

const HandlerDetails = ({
  selectedNode,
  selectedHandler,
  handlerDetails,
  editableValue,
  setEditableValue,
  setHandlerDetails,
  router,
  fetchHandlerDetails,
  handlers,
  setHandlers,
  handleReset,
  handleWrite,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHandlers, setFilteredHandlers] = useState(handlers);
  const websocketService = new WebsocketService();
  const borderColor = useColorModeValue('gray.200', 'gray.700');


  useEffect(() => {
    if (selectedNode) {
      const element = router.getElement(selectedNode.id);
      setHandlers(element.handlers);
    }
  }, [selectedNode]);

  useEffect(() => {
    setFilteredHandlers(
      handlers.filter((handler) =>
        handler.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, handlers]);

  const handleSearchChange = (e) => {
    const searchValue = e.target.value.toLowerCase();
    setSearchTerm(searchValue);
    setFilteredHandlers(
      handlers.filter((handler) => handler.name.toLowerCase().includes(searchValue))
    );
  };

  const renderActionButton = (handler) => {
    if (handler.type.includes('w') && handler.type.includes('b')) {
      return (
        <Button colorScheme="orange" onClick={() => handleReset(handler)} size="sm">
          Reset
        </Button>
      );
    } else if (handler.type.includes('w') && handler.type.includes('r')) {
      return (
        <Button colorScheme="blue" onClick={() => handleWrite()} size="sm">
          Write
        </Button>
      );
    } else if (handler.type.includes('w')) {
      return (
        <Button colorScheme="green" onClick={() => handleWrite()} size="sm">
          Write
        </Button>
      );
    } else {
      return <Button isDisabled size="sm">Read-Only</Button>;
    }
  };


  return (
    <Box display="flex" height="75vh">
      <Box width="40%" maxHeight="100%" overflowY="auto" mr={5} flexShrink={0}>
        <Box position="sticky" top="0" bg="white" zIndex="1">
          <Input
            placeholder="Search handlers..."
            value={searchTerm}
            onChange={handleSearchChange}
            mb={3}
          />
        </Box>
        <Table variant="simple" size="sm" border="1px solid" borderColor={borderColor}>
          <Thead position="sticky" top="40px" bg="white" zIndex="1">
            <Tr>
              <Th>Handler</Th>
              <Th width="100px">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredHandlers.map((handler) => (
              <Tr key={handler.name} _hover={{ bg: 'gray.100' }} cursor="pointer">
                <Td borderBottom="1px solid" borderColor={borderColor} onClick={() => fetchHandlerDetails(handler)}>
                  {handler.name}
                </Td>
                <Td borderBottom="1px solid" borderColor={borderColor} width="100px">
                  {renderActionButton(handler)}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      <Box flex="1" p={3} border="1px solid" borderColor={borderColor} bg="gray.50" rounded="md" overflowY="auto">
        <Text fontSize="lg" fontWeight="bold" mb={2}>
          {selectedHandler || "Select a handler"}
        </Text>
        {handlers.find((h) => h.name === selectedHandler && h.type.includes('r') && h.type.includes('w')) ? (
          <>
            <Box mb={4}>{handlerDetails || "Handler details will appear here when selected"}</Box>
            <Input
              value={editableValue}
              onChange={(e) => setEditableValue(e.target.value)}
              placeholder="Enter new value"
              mb={3}
            />
            <Button colorScheme="green" onClick={handleWrite}>Save</Button>
          </>
        ) : handlers.find((h) => h.name === selectedHandler && h.type.includes('w')) ? (
          <>
            <Input
              value={editableValue}
              onChange={(e) => setEditableValue(e.target.value)}
              placeholder="Enter new value"
              mb={3}
            />
            <Button colorScheme="green" onClick={handleWrite}>Save</Button>
          </>
        ) : (
          <Box>{handlerDetails || "Handler details will appear here when selected"}</Box>
        )}
      </Box>
    </Box>
  );
};

export default HandlerDetails;
