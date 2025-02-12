import React, { useState, useMemo } from 'react';
import { Box, List, ListItem, Button, Tooltip, Input } from '@chakra-ui/react';
import { getAddColor, getLiveColor } from '../utils/colors';

const NodeListSidebar = ({ nodes, onNodeClick, router }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) =>
      node.data.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [nodes, searchTerm]);
  const isLocalNode = (node) => !router?.getElement(node.id);

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
        {filteredNodes.map((node) => {
          const local = isLocalNode(node);

          return (
            <Tooltip label={node.data.label} key={node.id}>
              <ListItem
                cursor={local ? "not-allowed" : "pointer"}
                onClick={() => !local && onNodeClick(node.id)}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              >
                <Button
                  width="100%"
                  justifyContent="flex-start"
                  backgroundColor={local ? getAddColor() : "white"}
                  _hover={local ? {} : { backgroundColor: getLiveColor() }}
                  isDisabled={local}
                >
                  {node.data.label}
                </Button>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );
};

export default React.memo(NodeListSidebar);
