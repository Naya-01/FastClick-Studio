import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Checkbox,
  VStack,
  HStack,
  Text,
  Flex
} from '@chakra-ui/react';
import { WebsocketService } from '../../services/webSocketService';
import GraphWithDate from './GraphWithDate';
import { computeDomain } from '../../utils/graphUtils';

const CustomGraph = ({ selectedNode, availableHandlers, title = "Custom Graph" }) => {
  const [configComplete, setConfigComplete] = useState(false);
  const [handler, setHandler] = useState("");
  const [delimiter, setDelimiter] = useState(",");
  const [previewTokens, setPreviewTokens] = useState([]);
  const [mapping, setMapping] = useState([]);
  const [formula, setFormula] = useState("");
  const [computeDifference, setComputeDifference] = useState(false);
  const [dataPoints, setDataPoints] = useState([]);
  const [cumulativeTotal, setCumulativeTotal] = useState(0);
  const [yAxisLabel, setYAxisLabel] = useState("Value");
  const [currentVariables, setCurrentVariables] = useState({});
  
  const lastRawValueRef = useRef(null);
  const initialRawValueRef = useRef(null);
  const intervalRef = useRef(null);
  const websocketService = new WebsocketService();

  useEffect(() => {
    if (handler) {
      fetchPreview();
    }
  }, [handler, delimiter, selectedNode]);

  const fetchPreview = () => {
    if (!selectedNode || !handler) return;
    websocketService.getHandlers(selectedNode.id, handler).subscribe({
      next: (rawData) => {
        let tokens = [];
        if (typeof rawData === "string") {
          tokens = rawData.split(delimiter).map(s => s.trim());
        } else if (Array.isArray(rawData)) {
          tokens = rawData.map(String);
        } else {
          tokens = [String(rawData)];
        }
        setPreviewTokens(tokens);
        const defaultMapping = tokens.map((token, index) => ({
          index,
          token,
          variableName: `variable${index + 1}`,
        }));
        setMapping(defaultMapping);
      },
      error: (err) => console.error("Preview error :", err),
    });
  };

  const evaluateFormula = (mapObj) => {
    try {
      const extractedVars = (formula.match(/\b[a-zA-Z_]\w*\b/g) || [])
        .filter(v => v !== "return");

      extractedVars.forEach(v => {
        if (!(v in mapObj)) {
          mapObj[v] = 0;
        }
      });
      const varNames = Object.keys(mapObj);
      const varValues = varNames.map(key => mapObj[key]);
      const func = new Function(...varNames, "return " + formula);
      const result = func(...varValues);
      return result;
    } catch (e) {
      console.error("Error evaluating formula:", e);
      return 0;
    }
  };

  const startGraph = () => {
    lastRawValueRef.current = null;
    initialRawValueRef.current = null;
    setDataPoints([]);
    setCumulativeTotal(0);
    setConfigComplete(true);
    fetchGraphData();
    intervalRef.current = setInterval(fetchGraphData, 5000);
  };

  const fetchGraphData = useCallback(() => {
    if (!handler) return;
    websocketService.getHandlers(selectedNode.id, handler).subscribe({
      next: (rawData) => {
        let tokens = [];

        if (typeof rawData === "string") {
          tokens = rawData.split(delimiter).map(s => {
            const n = parseFloat(s.trim());
            return isNaN(n) ? 0 : n;
          });
        } else if (Array.isArray(rawData)) {
          tokens = rawData.map(v => {
            const n = parseFloat(v);
            return isNaN(n) ? 0 : n;
          });
        } else {
          const n = Number(rawData);
          tokens = [isNaN(n) ? 0 : n];
        }
        const mapObj = {};
        mapping.forEach(item => {
          if (tokens[item.index] !== undefined) {
            mapObj[item.variableName] = tokens[item.index];
          }
        });

        setCurrentVariables(mapObj);

        const rawValue = evaluateFormula(mapObj);
        let computedValue = rawValue;

        if (computeDifference) {
          if (lastRawValueRef.current === null) {
            computedValue = 0;
            lastRawValueRef.current = rawValue;
            initialRawValueRef.current = rawValue;
          } else {
            const diff = rawValue - lastRawValueRef.current;
            computedValue = diff < 0 ? 0 : diff;
            lastRawValueRef.current = rawValue;
          }
          setCumulativeTotal(lastRawValueRef.current - initialRawValueRef.current);
        } else {
          if (initialRawValueRef.current === null) {
            initialRawValueRef.current = rawValue;
          }
          computedValue = rawValue;
          setCumulativeTotal(rawValue - initialRawValueRef.current);
        }

        const now = new Date();
        const formattedTime = now.toLocaleString();
        setDataPoints(prev => [...prev, { time: formattedTime, value: computedValue }].slice(-20));
      },
      error: (err) => console.error("Data fetch error :", err)
    });
  }, [handler, selectedNode.id, delimiter, mapping, formula, computeDifference, websocketService]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!configComplete) {
    return (
      <Box p={4}>
        <VStack spacing={4} align="stretch">
          <Text fontSize="xl" fontWeight="bold">Custom graphic configuration</Text>
          <FormControl>
            <FormLabel>Handler</FormLabel>
            <Select value={handler} onChange={(e) => setHandler(e.target.value)}>
              <option value="">-- Select a handler --</option>
              {availableHandlers.map((h, idx) => (
                <option key={idx} value={h.name}>{h.name}</option>
              ))}
            </Select>
          </FormControl>
          <FormControl>
            <FormLabel>Delimiter</FormLabel>
            <Input value={delimiter} onChange={(e) => setDelimiter(e.target.value)} placeholder="e.g. , or space or \n" />
          </FormControl>
          <FormControl>
            <FormLabel>Y axis name</FormLabel>
            <Input value={yAxisLabel} onChange={(e) => setYAxisLabel(e.target.value)} placeholder="Y axis name" />
          </FormControl>
          {previewTokens.length > 0 && (
            <Box border="1px solid" borderColor="gray.300" p={3} borderRadius="md">
              <Text fontWeight="bold" mb={2}>Preview</Text>
              {previewTokens.map((token, idx) => (
                <HStack key={idx}>
                  <Text>[{idx}]: {token}</Text>
                  <Input
                    value={mapping[idx]?.variableName || `variable${idx + 1}`}
                    onChange={(e) => {
                      const newMapping = [...mapping];
                      newMapping[idx] = { ...newMapping[idx], variableName: e.target.value };
                      setMapping(newMapping);
                    }}
                    placeholder={`Variable name ${idx + 1}`}
                    size="sm"
                    width="120px"
                  />
                </HStack>
              ))}
            </Box>
          )}
          <FormControl isRequired>
            <FormLabel>
              Formula
            </FormLabel>
            <Input
              value={formula}
              onChange={(e) => setFormula(e.target.value)}
              placeholder="e.g. variable3 / variable2"
            />
          </FormControl>
          <FormControl>
            <Checkbox
              isChecked={computeDifference}
              onChange={(e) => setComputeDifference(e.target.checked)}
            >
              Calculate the difference between successive points
            </Checkbox>
          </FormControl>
          <HStack spacing={4}>
            <Button colorScheme="gray" onClick={() => {
              setHandler("");
              setDelimiter(",");
              setPreviewTokens([]);
              setMapping([]);
              setFormula("");
              setComputeDifference(false);
              setYAxisLabel("Value");
            }}>
              Reset
            </Button>
            <Button colorScheme="green" onClick={startGraph} disabled={!formula}>
              Finish and display the graph
            </Button>
          </HStack>
        </VStack>
      </Box>
    );
  }

  const domain = () => {
    return computeDomain(dataPoints, 'value');
  };

  const extractedVars = (formula.match(/\b[a-zA-Z_]\w*\b/g) || []).filter(v => v !== "return");
  const displayedMapping = mapping.filter(item => extractedVars.includes(item.variableName));


  return (
    <Box p={4}>
      <Flex direction="row" gap={4} align="center">
        <GraphWithDate
          title={title}
          data={dataPoints}
          xDataKey="time"
          xLabel="Date & Time"
          yDataKey="value"
          yLabel={yAxisLabel}
          computeDomain={domain}
          lineName={title}
          stroke="#8884d8"
        />
        <Box
          mb={4}
          p={2}
          border="1px solid"
          borderColor="gray.300"
          borderRadius="md"
          width="fit-content"
        >
          {computeDifference && <Text mb={2}>Cumulative Total: {cumulativeTotal}</Text>}
          {displayedMapping.length > 0 && (
            <>
              <Text fontWeight="bold" mb={2}>Selected Variables:</Text>
              {displayedMapping.map((item, idx) => (
                <Text key={idx}>
                  {item.variableName}:{" "}
                  {currentVariables[item.variableName] !== undefined
                    ? currentVariables[item.variableName]
                    : (previewTokens[item.index] || 'N/A')}
                </Text>
              ))}
              <Text mt={2} fontWeight="bold">Formula: {formula}</Text>
            </>
          )}
        </Box>
      </Flex>
    </Box>
  );
  
};

export default CustomGraph;
