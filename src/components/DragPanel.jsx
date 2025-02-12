import React, { useState, useMemo, useCallback } from 'react';
import { Box, Text, Input, List, ListItem, Button, Tooltip } from '@chakra-ui/react';
import { parseXMLFile } from '../services/elementService';
import { getLiveColor } from '../utils/colors';

const ITEMS_PER_PAGE = 10;

const DragPanel = () => {
  const [elements, setElements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);

  const handleFileUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const parsedElements = parseXMLFile(e.target.result);
        setElements(parsedElements);
        setCurrentPage(0);
      };
      reader.readAsText(file);
    }
  }, []);

  const onDragStart = useCallback((event, element) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(element));
    event.dataTransfer.effectAllowed = 'move';
  }, []);

  const filteredElements = useMemo(() => {
    return elements.filter((element) =>
      element.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [elements, searchTerm]);

  const maxPages = Math.ceil(filteredElements.length / ITEMS_PER_PAGE);
  if (currentPage >= maxPages && maxPages > 0) {
    setCurrentPage(0);
  }

  const startIdx = currentPage * ITEMS_PER_PAGE;
  const visibleElements = useMemo(() => {
    return filteredElements.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  }, [filteredElements, startIdx]);

  return (
    <Box
      width="250px"
      p="10px"
      borderRight="1px solid #ccc"
      background="#f9f9f9"
      overflowY="auto"
      //position="fixed"
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
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(0);
        }}
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
        {visibleElements.map((element) => (
          <Tooltip label={element.name} key={element.name}>
            <ListItem
              draggable
              onDragStart={(event) => onDragStart(event, element)}
              cursor="grab"
              whiteSpace="nowrap"
              overflow="hidden"
              textOverflow="ellipsis"
            >
              <Button
                width="100%"
                justifyContent="flex-start"
                backgroundColor="white"
                _hover={{ backgroundColor: getLiveColor() }}
                p={2}
                pointerEvents="none"
              >
                <Box textAlign="left" pointerEvents="auto">
                  <Text fontWeight="bold">{element.name}</Text>
                </Box>
              </Button>
            </ListItem>
          </Tooltip>
        ))}
      </List>

      <Box mt={4} textAlign="center">
        {startIdx + ITEMS_PER_PAGE < filteredElements.length && (
          <Button 
            width="100%" 
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        )}
        {currentPage > 0 && (
          <Button 
            width="100%" 
            onClick={() => setCurrentPage((prev) => prev - 1)}
            mb={2}
          >
            Previous
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default React.memo(DragPanel);
