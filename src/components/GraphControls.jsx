import React from 'react';
import { Button } from '@chakra-ui/react';

export const GraphControls = ({ onDownloadImage, onGenerateConfig }) => {
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
        right="500px"
        colorScheme="green"
        zIndex="10"
      >
        Save click configuration
      </Button>
    </>
  );
};