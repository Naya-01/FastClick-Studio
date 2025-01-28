import React, { useState } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button } from '@chakra-ui/react';

const AddNodeModal = ({ isOpen, onClose, onAddNode }) => {
  const [newNode, setNewNode] = useState({ id: '', type: '', configuration: '', inputs: 1, outputs: 1 });

  const handleAddNode = () => {
    onAddNode(newNode);
    setNewNode({ id: '', type: '', configuration: '', inputs: 1, outputs: 1 });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Node</ModalHeader>
        <ModalBody>
          <Input
            placeholder="Node Name"
            value={newNode.id}
            onChange={(e) => setNewNode({ ...newNode, id: e.target.value })}
            mb={3}
          />
          <Input
            placeholder="Node Class"
            value={newNode.type}
            onChange={(e) => setNewNode({ ...newNode, type: e.target.value })}
            mb={3}
          />
          <Input
            placeholder="Configuration"
            value={newNode.configuration}
            onChange={(e) => setNewNode({ ...newNode, configuration: e.target.value })}
            mb={3}
          />
          <Input
            type="number"
            placeholder="Inputs"
            value={newNode.inputs}
            onChange={(e) => setNewNode({ ...newNode, inputs: Number(e.target.value) })}
            mb={3}
          />
          <Input
            type="number"
            placeholder="Outputs"
            value={newNode.outputs}
            onChange={(e) => setNewNode({ ...newNode, outputs: Number(e.target.value) })}
            mb={3}
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleAddNode}>
            Add Node
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AddNodeModal;