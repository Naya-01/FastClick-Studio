import React, { useState } from 'react';
import { Box, List, ListItem, Button, Tooltip, Input } from '@chakra-ui/react';

const NodeListSidebar = ({ nodes, onNodeClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNodes = nodes.filter((node) =>
    node.data.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
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
      <Input
        placeholder="Search nodes..."
        mb={3}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <List spacing={3}>
        {filteredNodes.map((node) => (
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
};

export default NodeListSidebar;
