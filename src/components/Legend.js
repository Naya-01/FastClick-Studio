import React, { useState, useEffect } from 'react';
import { Box, Text, HStack, Input, Collapse, VStack } from '@chakra-ui/react';
import { getAddColor } from '../utils/colors';
import { COLORS_LEGEND } from '../utils/colors';
import { HandlerMode } from '../models/enums';

const getStorageKey = (mode) => `legendColorParams_${mode}`;

const Legend = ({ colorParams, setColorParams, mode }) => {
  const [isEditing, setIsEditing] = useState(false);
  console.log("colorParams", colorParams);

  const labelMode = mode === HandlerMode.COUNT ? 'packets/sec' : 'cycles/task';

  const legendItems = [
    { label: 'new element not saved', color: getAddColor() },
    { label: `${labelMode} < ${colorParams.medium}`, color: COLORS_LEGEND.low.background },
    { label: `${colorParams.medium} ≤ ${labelMode} ≤ ${colorParams.high}`, color: COLORS_LEGEND.medium.background },
    { label: `${labelMode} > ${colorParams.high}`, color: COLORS_LEGEND.high.background },
  ];

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  useEffect(() => {
    const stored = localStorage.getItem(getStorageKey(mode));
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setColorParams(prev => ({
          ...prev,
          [mode]: parsed,
        }));
      } catch (e) {
        console.error("Error while reading preferences", e);
      }
    }
  }, [mode, setColorParams]);

  useEffect(() => {
    localStorage.setItem(getStorageKey(mode), JSON.stringify(colorParams));
  }, [colorParams, mode]);

  return (
    <Box
      position="absolute"
      bottom="10px"
      left="260px"
      bg="white"
      p={2}
      borderRadius="md"
      border="1px solid"
      borderColor="gray.300"
      zIndex="20"
      width="fit-content"
    >
      <HStack justify="space-between" align="center">
        <Text fontWeight="bold">Legend</Text>
        <Box
          as="button"
          onClick={toggleEdit}
          fontSize="xs"
          bg="transparent"
          _hover={{ cursor: 'pointer' }}
        >
          {isEditing ? '✔️ validation' : '✏️ edit'}
        </Box>
      </HStack>
      <VStack spacing={2} align="start" mt={2}>
        {legendItems.map((item, idx) => (
          <HStack key={idx} spacing={2}>
            <Box width="16px" height="16px" bg={item.color} borderRadius="md" />
            <Text fontSize="sm">{item.label}</Text>
          </HStack>
        ))}
      </VStack>
      <Collapse in={isEditing} animateOpacity>
        <VStack mt={2} spacing={2} align="start">
          <HStack spacing={2}>
            <Text fontSize="sm">Medium:</Text>
            <Input
              size="xs"
              type="number"
              value={colorParams.medium}
              onChange={(e) =>
                setColorParams((prev) => ({
                  ...prev,
                  [mode]: {
                    ...prev[mode],
                    medium: Number(e.target.value),
                  },
                }))
              }
              width="60px"
            />
          </HStack>
          <HStack spacing={2}>
            <Text fontSize="sm">High:</Text>
            <Input
              size="xs"
              type="number"
              value={colorParams.high}
              onChange={(e) =>
                setColorParams((prev) => ({
                  ...prev,
                  [mode]: {
                    ...prev[mode],
                    high: Number(e.target.value),
                  },
                }))
              }
              width="60px"
            />
          </HStack>
        </VStack>
      </Collapse>
    </Box>
  );
};

export default Legend;
