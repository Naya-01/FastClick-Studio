import React, { useState, useMemo } from 'react';
import { Box, List, ListItem, Button, Tooltip, Input, HStack } from '@chakra-ui/react';
import { getAddColor, getLiveColor } from '../utils/colors';

const NodeListSidebar = ({nodes, onNodeClick, router, onTargetNode}) => {
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
              <ListItem>
                <HStack spacing={2}>
                  <Button
                    cursor={local ? "not-allowed" : "pointer"}
                    overflow="hidden"
                    whiteSpace="nowrap"
                    textOverflow="ellipsis"
                    flex="1"
                    justifyContent="flex-start"
                    backgroundColor={local ? getAddColor() : 'white'}
                    _hover={local ? {} : { backgroundColor: getLiveColor() }}
                    isDisabled={local}
                    onClick={() => !local && onNodeClick(node.id)}
                  >
                    {node.data.label}
                  </Button>
                  <Button
                    size="xs"
                    colorScheme="purple"
                    onClick={() => onTargetNode(node.id)}
                  >
                    T
                  </Button>
                </HStack>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );
};

const areEqual = (prevProps, nextProps) => {
  if (prevProps.nodes.length !== nextProps.nodes.length) return false;

  for (let i = 0; i < prevProps.nodes.length; i++) {
    const prevNode = prevProps.nodes[i];
    const nextNode = nextProps.nodes[i];
    if (prevNode.id !== nextNode.id) return false;
    if (prevNode.data.label !== nextNode.data.label) return false;
  }
  if (prevProps.router !== nextProps.router) return false;

  return true;
};

export default React.memo(NodeListSidebar, areEqual);
