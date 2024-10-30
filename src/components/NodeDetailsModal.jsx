import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
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

const NodeDetailsModal = ({ isOpen, onClose, selectedNode }) => {
  const [handlers, setHandlers] = useState([]);
  const [selectedHandler, setSelectedHandler] = useState("");
  const [handlerDetails, setHandlerDetails] = useState("");
  const [editableValue, setEditableValue] = useState("");
  const websocketService = new WebsocketService();
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const parseHandlers = (data) => {
    return data
      .split("\n")
      .map((line) => {
        const [name, type] = line.split(/\s+/);
        return { name, type };
      })
      .filter(({ name }) => name);
  };

  useEffect(() => {
    if (selectedNode) {
      const subscription = websocketService.getAllHandlersFields(selectedNode.id).subscribe({
        next: (data) => {
          setHandlers(parseHandlers(data));
        },
        error: (error) => console.error("Error fetching handler names:", error),
      });
      return () => subscription.unsubscribe();
    }
  }, [selectedNode]);

  const fetchHandlerDetails = (handler) => {
    setSelectedHandler(handler.name);

    if (handler.type.includes('r')) {  
      websocketService.getHandlers(selectedNode.id, handler.name).subscribe({
        next: (data) => {
          setHandlerDetails(data != null ? String(data) : "No details available");
        },
        error: (error) => console.error("Error fetching handler details:", error),
      });
    } else {
      setHandlerDetails("Handler is not readable");
    }
  };

  const handleReset = (handler) => {
    websocketService.postHandler(selectedNode.id, handler.name).subscribe({
      next: () => {
        setHandlerDetails("Reset successful");
      },
      error: (error) => console.error("Error resetting handler:", error),
    });
  };

  const handleWrite = () => {
    websocketService.postHandler(selectedNode.id, selectedHandler, editableValue).subscribe({
      next: () => {
        setHandlerDetails(`Updated ${selectedHandler} to ${editableValue}`);
      },
      error: (error) => console.error("Error updating handler:", error),
    });
  };

  const handleClose = () => {
    setSelectedHandler("");
    setHandlerDetails("");
    setEditableValue("");
    onClose();
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
        <Button colorScheme="blue" onClick={() => handleWrite(handler)} size="sm">
          Write
        </Button>
      );
    } else if (handler.type.includes('w')) {
      return (
        <Button colorScheme="green" onClick={() => handleWrite(handler)} size="sm">
          Write
        </Button>
      );
    } else {
      return <Button isDisabled size="sm">Read-Only</Button>;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Node Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedNode && (
            <>
              <Text fontWeight="bold" mb={3}>Node: {selectedNode.data.label}</Text>

              <Box display="flex">
                <Table variant="simple" size="sm" mt={5} border="1px solid" borderColor={borderColor} width="40%">
                  <Thead>
                    <Tr>
                      <Th>Handler</Th>
                      <Th width="100px">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {handlers.map((handler) => (
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

                <Box ml={5} p={3} border="1px solid" borderColor={borderColor} flex="1" bg="gray.50" rounded="md">
                  <Text fontSize="lg" fontWeight="bold" mb={2}>
                    {selectedHandler || "Select a handler"}
                  </Text>
                  {handlers.find((h) => h.name === selectedHandler && h.type.includes('w')) ? (
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
                    <Text>{handlerDetails || "Handler details will appear here when selected"}</Text>
                  )}
                </Box>
              </Box>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NodeDetailsModal;
