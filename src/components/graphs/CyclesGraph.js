import React, { useState, useEffect, useRef } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { WebsocketService } from '../../services/webSocketService';
import GraphWithDate from './GraphWithDate';
import { computeDomain } from '../../utils/graphUtils';

const CyclesGraph = ({ selectedNode }) => {
  const [graphData, setGraphData] = useState([]);
  const [data, setData] = useState({ calls: 0, cycles: 0 });
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);
  const websocketService = new WebsocketService();

  const fetchCyclesGraph = () => {
    websocketService.getHandlers(selectedNode.id, "cycles").subscribe({
      next: (response) => {
        if (!response || response.trim() === "") return;

        const tokens = response.split(" ");
        if (tokens.length < 3) return;

        const types = tokens[0];
        const calls = Number(tokens[1]);
        const cycles = Number(tokens[2]);
        if (isNaN(calls) || isNaN(cycles) || calls === 0) return;

        const cyclesPerTask = cycles / calls;
        const now = new Date();
        const formattedTime = now.toLocaleString();

        setData({ calls, cycles });

        setGraphData(prevData => {
          const newPoint = { time: formattedTime, cyclesPerTask, types };
          const updatedData = [...prevData, newPoint];
          return updatedData.slice(-20);
        });
      },
      error: (error) => console.error("Error fetching cycles data:", error)
    });
  };

  const domain = () => {
    return computeDomain(graphData, 'cyclesPerTask');
  };

  useEffect(() => {
    startTimeRef.current = Date.now();
    setGraphData([]);
    fetchCyclesGraph();
    intervalRef.current = setInterval(fetchCyclesGraph, 5000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [selectedNode]);

  const lastType = graphData.length ? graphData[graphData.length - 1].types : '';

  return (
    <Box>
      <Text mt={3}>
        Total {lastType} calls: {data.calls} & cycles: {data.cycles}
      </Text>
      <GraphWithDate 
        title={`Cycles per ${lastType} Graph (Date & Time)`}
        data={graphData}
        xDataKey="time"
        xLabel="Date & Time"
        yDataKey="cyclesPerTask"
        yLabel={`Cycles/${lastType}`}
        computeDomain={domain}
        lineName={`Cycles per ${lastType}`}
        stroke="#8884d8"
      />
    </Box>
  );
};

export default CyclesGraph;
