import React, { useState, memo } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Text,
  Switch,
  Flex,
} from '@chakra-ui/react';
import MultiGraphContainer from './graphs/MultiGraphContainer';
import HandlerDetails from './HandlerDetails';
import { WebsocketService } from '../services/webSocketService';

const NodeDetailsModal = memo(({ isOpen, onClose, selectedNode, router }) => {
  const [handlers, setHandlers] = useState([]);
  const [selectedHandler, setSelectedHandler] = useState("");
  const [handlerDetails, setHandlerDetails] = useState("");
  const [editableValue, setEditableValue] = useState("");
  const [showDetails, setShowDetails] = useState(true);
  const websocketService = new WebsocketService();

  const handleClose = () => {
    setSelectedHandler("");
    setHandlerDetails("");
    setEditableValue("");
    onClose();
  };

  const fetchHandlerDetails = (handler) => {
    setSelectedHandler(handler.name);

    if (handler.type.includes('r')) {  
      websocketService.getHandlers(selectedNode.id, handler.name).subscribe({
        next: (data) => {
          const formattedData = data != null ? String(data) : "No details available";
          setHandlerDetails(<pre>{formattedData}</pre>);
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="full">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          Node Details
          <Flex align="center" ml={4}>
            <Text mr={2}>Show Graph Mode</Text>
            <Switch 
              isChecked={!showDetails} 
              onChange={() => setShowDetails(!showDetails)} 
            />
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {selectedNode && (
            <>
              <Text fontWeight="bold" mb={3} fontSize='2xl'>Node: {selectedNode.data.label}</Text>

              {showDetails ? (
                <HandlerDetails
                  selectedNode={selectedNode}
                  selectedHandler={selectedHandler}
                  handlerDetails={handlerDetails}
                  editableValue={editableValue}
                  setEditableValue={setEditableValue}
                  setHandlerDetails={setHandlerDetails}
                  router={router}
                  fetchHandlerDetails={fetchHandlerDetails}
                  handlers={handlers}
                  setHandlers={setHandlers}
                  handleReset={handleReset}
                  handleWrite={handleWrite}
                />
              ) : (
                <MultiGraphContainer selectedNode={selectedNode} handlers={handlers}/>
              )}
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
});

export default NodeDetailsModal;
