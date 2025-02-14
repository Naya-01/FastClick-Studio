import React from 'react';
import { Button } from '@chakra-ui/react';

export const GraphControls = ({ onDownloadImage, onGenerateConfig, onReorganize }) => {
  return (
    <>
      <Button
        onClick={onDownloadImage}
        position="absolute"
        top="10px"
        right="270px"
        colorScheme="blue"
        zIndex="10"
      >
        Download Graph
      </Button>

      <Button
        onClick={onGenerateConfig}
        position="absolute"
        top="10px"
        right="450"
        colorScheme="green"
        zIndex="10"
      >
        Save click configuration
      </Button>

      <Button
        onClick={onReorganize}
        position="absolute"
        top="10px"
        right="670"
        colorScheme="purple"
        zIndex="10"
      >
        Reorganize Nodes
      </Button>
    </>
  );
};