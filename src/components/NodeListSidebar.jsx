import React from 'react';
import { Box, List, ListItem, Button, Tooltip } from '@chakra-ui/react';

const NodeListSidebar = ({ nodes, onNodeClick }) => (
  <Box
    width="250px"
    p="10px"
    borderLeft="1px solid #ccc"
    background="#f9f9f9"
    overflowY="auto"
    position="fixed"
    right="0"
    top="0"
    bottom="0"
  >
    <List spacing={3}>
      {nodes.map((node) => (
        <Tooltip label={node.data.label} key={node.id}>
          <ListItem
            cursor="pointer"
            onClick={() => onNodeClick(node.id)}
            whiteSpace="nowrap"
            overflow="hidden"
            textOverflow="ellipsis"
          >
            <Button width="100%" justifyContent="flex-start">
              {node.data.label}
            </Button>
          </ListItem>
        </Tooltip>
      ))}
    </List>
  </Box>
);

export default NodeListSidebar;
