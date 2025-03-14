import React, { useState, useEffect, useRef } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { WebsocketService } from '../../services/webSocketService';
import GraphWithDate from './GraphWithDate';

const ThroughputGraph = ({ selectedNode }) => {
  const [throughputData, setThroughputData] = useState([]);
  const [cumulativeTotal, setCumulativeTotal] = useState(0);

  const lastReadingRef = useRef(null);
  const initialCountRef = useRef(null);
  const startTimeRef = useRef(null);
  const intervalRef = useRef(null);

  const websocketService = new WebsocketService();

  const fetchThroughputGraph = () => {
    websocketService.getHandlers(selectedNode.id, "count").subscribe({
      next: (data) => {
        let currentCount;
        if (Array.isArray(data)) {
          currentCount = Number(data[0]);
        } else {
          try {
            currentCount = Number(JSON.parse(data));
          } catch (e) {
            currentCount = Number(data);
          }
        }
        let throughput = 0;
        if (lastReadingRef.current === null) {
          lastReadingRef.current = currentCount;
          initialCountRef.current = currentCount;
          throughput = 0;
        } else {
          const diff = currentCount - lastReadingRef.current;
          throughput = diff < 0 ? 0 : diff / 5;
          lastReadingRef.current = currentCount;
        }
        setCumulativeTotal(lastReadingRef.current - initialCountRef.current);
        const now = new Date();
        const formattedTime = now.toLocaleString();
        const elapsed = Math.floor((now - startTimeRef.current) / 1000);
        setThroughputData(prevData => {
          const newPoint = { time: elapsed, count: throughput };
          const updatedData = [...prevData, newPoint];
          return updatedData.slice(-20);
        });
      },
      error: (error) => console.error("Error fetching throughput data:", error)
    });
  };

  const computeDomain = () => {
    if (throughputData.length === 0) return [0, 1];
    const values = throughputData.map(d => d.count);
    const min = Math.min(...values);
    const max = Math.max(...values);
    if (min === Infinity || max === -Infinity || isNaN(min) || isNaN(max)) return [0, 1];
    if (min === max) return [min - 1, max + 1];
    const margin = (max - min) * 0.1;
    return [min - margin, max + margin];
  };

  useEffect(() => {
    lastReadingRef.current = null;
    initialCountRef.current = null;
    startTimeRef.current = Date.now();
    setThroughputData([]);
    setCumulativeTotal(0);
    fetchThroughputGraph();
    intervalRef.current = setInterval(fetchThroughputGraph, 5000);
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [selectedNode]);

  return (
    <Box>
      <Text mt={3}>Total Packets: {cumulativeTotal}</Text>
      <GraphWithDate
        title="Throughput Graph (Seconds)"
        data={throughputData}
        xDataKey="time"
        xLabel="Time (s)"
        yDataKey="count"
        yLabel="Packets/s"
        computeDomain={computeDomain}
        lineName="Throughput (packets/s)"
        stroke="#8884d8"
        turnAngle={false}
        startTime={new Date(startTimeRef.current).toLocaleString()}
      />
    </Box>
  );
};

export default ThroughputGraph;
