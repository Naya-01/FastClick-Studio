import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider
} from '@chakra-ui/react';

export const GraphControls = ({ onDownloadImage, onGenerateConfig, onReorganize, onDownloadFlatConfig, openRouterDetails }) => {
  const [format, setFormat] = useState('png');

  return (
    <Box position="absolute" top="10px" right="270px" zIndex="10">
      <Menu>
        <MenuButton as={Button} colorScheme="blue">
          ☰ Controls
        </MenuButton>
        <MenuList>
          <MenuItem onClick={openRouterDetails}>
            Router details
          </MenuItem>
          <MenuItem onClick={() => onDownloadImage(format)}>
            Download Graph ({format.toUpperCase()})
          </MenuItem>
          <MenuDivider />
          <MenuItem onClick={() => setFormat('png')}>
            Set Format to PNG
          </MenuItem>
          <MenuItem onClick={() => setFormat('svg')}>
            Set Format to SVG
          </MenuItem>
          <MenuDivider />
          <MenuItem onClick={onGenerateConfig} isDisabled={!onGenerateConfig}>
            Save Click Configuration
          </MenuItem>
          <MenuItem onClick={onDownloadFlatConfig}>
            Download Flat Configuration
          </MenuItem>
          <MenuItem onClick={onReorganize}>
            Reorganize Nodes
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};
