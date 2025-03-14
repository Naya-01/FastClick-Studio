import React, { useState } from 'react';
import { Button, ButtonGroup } from '@chakra-ui/react';

export const GraphControls = ({ onDownloadImage, onGenerateConfig, onReorganize }) => {
  const [format, setFormat] = useState('png');
  return (
    <>
      <Button
        onClick={() => onDownloadImage(format)}
        position="absolute"
        top="10px"
        right="410px"
        colorScheme="blue"
        zIndex="10"
      >
        Download Graph
      </Button>

      <ButtonGroup
        isAttached
        variant="outline"
        position="absolute"
        top="10px"
        right="270px"
        zIndex="10"
      >
        <Button 
          colorScheme={format === 'png' ? 'blue' : 'gray'} 
          onClick={() => setFormat('png')}
        >
          PNG
        </Button>
        <Button 
          colorScheme={format === 'svg' ? 'blue' : 'gray'} 
          onClick={() => setFormat('svg')}
        >
          SVG
        </Button>
      </ButtonGroup>

      <Button
        onClick={onGenerateConfig}
        position="absolute"
        top="10px"
        right="590"
        colorScheme="green"
        zIndex="10"
      >
        Save click configuration
      </Button>

      <Button
        onClick={onReorganize}
        position="absolute"
        top="10px"
        right="820"
        colorScheme="purple"
        zIndex="10"
      >
        Reorganize Nodes
      </Button>
    </>
  );
};