import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Text, Input, List, ListItem, Button, Tooltip } from '@chakra-ui/react';
import { parseXMLFile } from '../services/elementService';
import { getLiveColor } from '../utils/colors';
import { WebsocketService } from '../services/webSocketService';

const ITEMS_PER_PAGE = 11;

const defaultNode = { 
  id: '', 
  type: '', 
  configuration: '', 
  inputs: 1, 
  outputs: 1 
};

const DragPanel = () => {
  const [elements, setElements] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [elementMapError, setElementMapError] = useState(false);
  const webSocketService = new WebsocketService();

  const fetchElementMap = useCallback(() => {
    const subscription = webSocketService.getElementMap().subscribe({
      next: (elementMapString) => {

        if (elementMapString.startsWith("Could not open elementmap file")) {
          setElementMapError(true);
          setElements([]);
          return;
        }

        try {
          const parsedElements = parseXMLFile(elementMapString);
          setElements(parsedElements);
          setCurrentPage(0);
        } catch (error) {
          console.error("Error parsing XML:", error);
        }
      },
      error: (error) => {
        console.error("Error fetching map element:", error);
      },
    });
    return () => subscription.unsubscribe();
  }, [webSocketService]);

  useEffect(() => {
    fetchElementMap();
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
        onDragStart={(event) => onDragStart(event, defaultNode)}
        style={{
          border: '1px dashed #ccc',
          padding: '10px',
          marginBottom: '10px',
          cursor: 'grab',
          backgroundColor: '#fff',
        }}
      >
        Drag custom Node
      </Box>

      {elementMapError ? (
        <Text color="red.500" mt={4}>No element map file found</Text>
      ) : (
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
      )}

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
