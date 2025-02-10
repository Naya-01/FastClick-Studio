import React, { useState } from 'react';
import { Box, Text, Input, List, ListItem, Button, Tooltip } from '@chakra-ui/react';
import { parseXMLFile } from '../services/elementService';
import { getLiveColor } from '../utils/colors';

const ITEMS_PER_PAGE = 10 ;

export const DragPanel = () => {
  const [elements, setElements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const parsedElements = parseXMLFile(e.target.result);
        setElements(parsedElements);
        setVisibleCount(ITEMS_PER_PAGE);
      };
      reader.readAsText(file);
    }
  };

  const onDragStart = (event, element) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(element));
    event.dataTransfer.effectAllowed = 'move';
  };

  const filteredElements = elements
    .filter((element) => element.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, visibleCount);

  return (
    <Box
      width="250px"
      p="10px"
      borderRight="1px solid #ccc"
      background="#f9f9f9"
      overflowY="auto"
      position="fixed"
      left="0"
      top="0"
      bottom="0"
      zIndex={10}
    >
      <Input type="file" accept=".xml" onChange={handleFileUpload} mb={3} />
      <Input
        placeholder="Search elements..."
        mb={3}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <Box
        draggable
        onDragStart={(event) => onDragStart(event, 'default')}
        style={{
          border: '1px dashed #ccc',
          padding: '10px',
          marginBottom: '10px',
          cursor: 'grab',
          backgroundColor: '#fff',
        }}
      >
        Drag Node
      </Box>

      <List spacing={3}>
        {filteredElements.map((element) => (
          <Tooltip label={element.name} key={element.name}>
            <ListItem
              draggable
              onDragStart={(event) => onDragStart(event, element)}
              cursor="grab"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              <Button width="100%" justifyContent="flex-start" backgroundColor="white" _hover={{ backgroundColor: getLiveColor() }} p={2}>
                <Box textAlign="left">
                  <Text fontWeight="bold">{element.name}</Text>
                </Box>
              </Button>
            </ListItem>
          </Tooltip>
        ))}
      </List>

      {visibleCount < elements.length && (
        <Button 
          mt={4} 
          width="100%" 
          onClick={() => setVisibleCount(visibleCount + ITEMS_PER_PAGE)}
        >
          Charger plus...
        </Button>
      )}
    </Box>
  );
};
