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
} from '@chakra-ui/react';
import { WebsocketService } from '../services/webSocketService';

const NodeDetailsModal = ({ isOpen, onClose, selectedNode }) => {
  const [handlers, setHandlers] = useState([]);
  const [selectedHandler, setSelectedHandler] = useState("");
  const [handlerDetails, setHandlerDetails] = useState("");
  const websocketService = new WebsocketService();
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (selectedNode) {
      websocketService.getAllHandlersFields(selectedNode.id).subscribe(
        (data) => {
          const handlerNames = Array.isArray(data)
            ? data.map((line) => line.split(/\s+/)[0])
            : data.split("\n").map((line) => line.split(/\s+/)[0]); 
          setHandlers(handlerNames);
        },
        (error) => console.error("Erreur lors de la récupération des handlers:", error)
      );
    }
  }, [selectedNode]);

  const fetchHandlerDetails = (handler) => {
    setSelectedHandler(handler);
    websocketService.getHandlers(selectedNode.id, handler).subscribe(
      (data) => setHandlerDetails(data),
      (error) => console.error("Error fetching handler details:", error)
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Node Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedNode && (
            <>
              <Text fontWeight="bold" mb={3}>Label: {selectedNode.data.label}</Text>
              <Text mb={3}>Node ID: {selectedNode.id}</Text>

              <Box display="flex">
                <Table variant="simple" size="sm" mt={5} border="1px solid" borderColor={borderColor} width="40%">
                  <Thead>
                    <Tr>
                      <Th>Handler</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {handlers.map((handler) => (
                      <Tr
                        key={handler}
                        _hover={{ bg: 'gray.100' }}
                        onClick={() => fetchHandlerDetails(handler)}
                        cursor="pointer"
                      >
                        <Td borderBottom="1px solid" borderColor={borderColor}>{handler}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>

                <Box
                  ml={5}
                  p={3}
                  border="1px solid"
                  borderColor={borderColor}
                  flex="1"
                  bg="gray.50"
                  rounded="md"
                >
                  <Text fontSize="lg" fontWeight="bold" mb={2}>
                    {selectedHandler || "Select a handler"}
                  </Text>
                  <Text>{handlerDetails || "Handler details will appear here when selected"}</Text>
                </Box>
              </Box>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NodeDetailsModal;
