import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Button,
  Text,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from '@chakra-ui/react';

const NodeModal = ({ isOpen, onClose, onConfirm, initialNodeData, isEdit = false, router }) => {

  const defaultNode = { 
    id: '', 
    type: '', 
    configuration: '', 
    inputs: 1, 
    outputs: 1 
  };

  const [nodeData, setNodeData] = useState(initialNodeData || defaultNode);
  const [errors, setErrors] = useState({ id: '', type: '' });


  const renderField = (fieldName, label) => {
    const fieldValue = nodeData[fieldName];

    if (fieldValue && typeof fieldValue === 'object') {
      return (
        <>
          <Text>{`Number of ${label} ports: Minimum ${fieldValue.min}, Maximum : ${fieldValue.max}`}</Text>
          <Input
            type="number"
            placeholder={`${label} Min`}
            value={fieldValue.number || fieldValue.min}
            onChange={(e) => setNodeData({ 
              ...nodeData, 
              [fieldName]: {
                ...fieldValue,
                number : Number(e.target.value)
              }
            })}
            mb={3}
            min={fieldValue.min}
            max={fieldValue.max}
          />
        </>
      );
    } else {
      return (
        <>
          <Text>{`Number of ${label} ports`}</Text>
          <Input
              type="number"
              placeholder={label}
              value={fieldValue}
              onChange={(e) => setNodeData({ 
                ...nodeData, 
                [fieldName]: Number(e.target.value)
              })}
              mb={3}
              min={0}
            />
        </>
      );
    }
  };


  useEffect(() => {
    setNodeData(initialNodeData || defaultNode);
    setErrors({ id: '', type: '' });
  }, [initialNodeData]);

  const handleConfirm = () => {
    const trimmedId = nodeData.id.trim();
    const trimmedType = nodeData.type.trim();

    let hasError = false;
    const newErrors = { id: '', type: '' };
    if (trimmedId === '') {
      newErrors.id = 'The node name is required.';
      hasError = true;
    }
    if (trimmedType === '') {
      newErrors.type = 'The node class is required.';
      hasError = true;
    }

    if (router && router.getElement && trimmedId !== '') {
      const existing = router.getElement(trimmedId);
      if (existing && (!isEdit || (isEdit && trimmedId !== initialNodeData.id.trim()))) {
        newErrors.id = 'This node name is already in use.';
        hasError = true;
      }
    }

    if (hasError) {
      setErrors(newErrors);
      return;
    }

    const formatField = (field) => {
      if (typeof field === 'object') {
        return (field.number !== undefined ? field.number : field.min);
      }
      return field;
    };

    const formattedNodeData = {
      ...nodeData,
      inputs: formatField(nodeData.inputs),
      outputs: formatField(nodeData.outputs),
    };

    if(isEdit){
        onConfirm(formattedNodeData, initialNodeData.id);
    }else{
        onConfirm(formattedNodeData);
    }
    setNodeData(defaultNode);
    setErrors({ id: '', type: '' });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEdit ? "Edit Node" : "Add New Node"}</ModalHeader>
        <ModalBody>
        <FormControl isInvalid={!!errors.id} isRequired mb={3}>
            <FormLabel>Node Name</FormLabel>
            <Input
              placeholder="Node Name"
              value={nodeData.id}
              onChange={(e) => {
                setNodeData({ ...nodeData, id: e.target.value });
                if (e.target.value.trim() !== '') {
                  setErrors((prev) => ({ ...prev, id: false }));
                }
              }}
            />
            {errors.id && <FormErrorMessage>{errors.id}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={!!errors.type} isRequired mb={3}>
            <FormLabel>Node Class</FormLabel>
            <Input
              placeholder="Node Class"
              value={nodeData.type}
              onChange={(e) => {
                setNodeData({ ...nodeData, type: e.target.value });
                if (e.target.value.trim() !== '') {
                  setErrors((prev) => ({ ...prev, type: false }));
                }
              }}
            />
            {errors.type && <FormErrorMessage>{errors.type}</FormErrorMessage>}
          </FormControl>

          <Input
            placeholder="Configuration"
            value={nodeData.configuration}
            onChange={(e) => setNodeData({ ...nodeData, configuration: e.target.value })}
            mb={3}
          />
          {/* <Input
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
          /> */}
          {renderField("inputs", "Inputs")}
          {renderField("outputs", "Outputs")}
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
