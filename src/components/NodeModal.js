import React, { useState, useEffect } from 'react';
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Button } from '@chakra-ui/react';

const NodeModal = ({ isOpen, onClose, onConfirm, initialNodeData, isEdit = false }) => {
  const [nodeData, setNodeData] = useState(initialNodeData || { id: '', type: '', configuration: '', inputs: 1, outputs: 1 });

  useEffect(() => {
    setNodeData(initialNodeData || { id: '', type: '', configuration: '', inputs: 1, outputs: 1 });
  }, [initialNodeData]);

  const handleConfirm = () => {
    onConfirm(nodeData);
    setNodeData({ id: '', type: '', configuration: '', inputs: 1, outputs: 1 });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEdit ? "Edit Node" : "Add New Node"}</ModalHeader>
        <ModalBody>
          <Input
            placeholder="Node Name"
            value={nodeData.id}
            onChange={(e) => setNodeData({ ...nodeData, id: e.target.value })}
            mb={3}
            isDisabled={isEdit}
          />
          <Input
            placeholder="Node Class"
            value={nodeData.type}
            onChange={(e) => setNodeData({ ...nodeData, type: e.target.value })}
            mb={3}
          />
          <Input
            placeholder="Configuration"
            value={nodeData.configuration}
            onChange={(e) => setNodeData({ ...nodeData, configuration: e.target.value })}
            mb={3}
          />
          <Input
            type="number"
            placeholder="Inputs"
            value={nodeData.inputs}
            onChange={(e) => setNodeData({ ...nodeData, inputs: Number(e.target.value) })}
            mb={3}
          />
          <Input
            type="number"
            placeholder="Outputs"
            value={nodeData.outputs}
            onChange={(e) => setNodeData({ ...nodeData, outputs: Number(e.target.value) })}
            mb={3}
          />
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" onClick={handleConfirm}>
            {isEdit ? "Save Changes" : "Add Node"}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default NodeModal;
