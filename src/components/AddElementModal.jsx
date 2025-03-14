import React from 'react';
import { Box, Button, Input } from '@chakra-ui/react';

const AddElementModal = ({ isOpen, onCancel, onConfirm, newElementName, setNewElementName, classesData }) => {

  if (!isOpen) return null;

  return (
    <Box
      position="fixed"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      bg="white"
      p={4}
      boxShadow="lg"
      zIndex={1000}
      borderRadius="md"
      maxW="300px"
    >
      <Box mb={3}>
        <Input
          placeholder="Entrez le nom de l'élément"
          value={newElementName}
          onChange={(e) => setNewElementName(e.target.value)}
          isRequired
          list="classes-suggestions"
        />
        <datalist id="classes-suggestions">
          {classesData &&
            classesData.map((className) => (
              <option key={className} value={className} />
            ))}
        </datalist>
      </Box>
      <Box display="flex" justifyContent="flex-end">
        <Button mr={2} onClick={onCancel}>
          Annuler
        </Button>
        <Button colorScheme="blue" onClick={onConfirm}>
          Confirmer
        </Button>
      </Box>
    </Box>
  );
};

export default AddElementModal;
