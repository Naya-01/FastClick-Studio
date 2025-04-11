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
import HandlerDetails from './HandlerDetails';
import { WebsocketService } from '../services/webSocketService';

const RouterDetails = memo(({ isOpen, onClose, router }) => {
    const [handlers, setHandlers] = useState([]);
    const [selectedHandler, setSelectedHandler] = useState("");
    const [handlerDetails, setHandlerDetails] = useState("");
    const [editableValue, setEditableValue] = useState("");
    const websocketService = new WebsocketService();
  
    const handleClose = () => {
      setSelectedHandler("");
      setHandlerDetails("");
      setEditableValue("");
      onClose();
    };

    const selectedNode = {
        id: "handlers",
        name: "handlers",
        type: "handlers",
    }


    const fetchHandlerDetails = (handler) => {
        setSelectedHandler(handler.name);
        if (handler.type.includes('r')) {  
        websocketService.getHandlersRouter(handler.name).subscribe({
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
        websocketService.postRouterHandler(handler.name).subscribe({
          next: () => {
            setHandlerDetails("Reset successful");
          },
          error: (error) => console.error("Error resetting handler:", error),
        });
      };
    
      const handleWrite = () => {
        websocketService.postRouterHandler(selectedHandler, editableValue).subscribe({
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
            <ModalHeader>Router Details</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
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
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" onClick={handleClose}>
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
    );
});

export default RouterDetails;