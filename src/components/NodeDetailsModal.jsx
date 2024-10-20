import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
} from '@chakra-ui/react';

const NodeDetailsModal = ({ isOpen, onClose, selectedNode }) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <ModalOverlay />
    <ModalContent>
      <ModalHeader>Node Details</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        {selectedNode && (
          <>
            <p>Label: {selectedNode.data.label}</p>
            <p>Node ID: {selectedNode.id}</p>
            <p>Type: {selectedNode.type}</p>
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

export default NodeDetailsModal;
