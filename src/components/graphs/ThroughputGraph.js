import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, Button } from '@chakra-ui/react';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { WebsocketService } from '../../services/webSocketService';

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
        const elapsed = ((Date.now() - startTimeRef.current) / 1000).toFixed(1);
        setThroughputData(prevData => {
          const newPoint = { time: elapsed, count: throughput };
          const updatedData = [...prevData, newPoint];
          return updatedData.slice(-20);
        });
      },
      error: (error) => console.error("Error fetching throughput data:", error)
    });
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
    <Box mt={5}>
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        Throughput Graph (Time in secondes)
      </Text>
      <Text mb={2}>Total Packets: {cumulativeTotal}</Text>
      <LineChart width={750} height={350} data={throughputData}>
        <CartesianGrid stroke="#ccc" />
        <XAxis
          dataKey="time"
          label={{ value: 'Time (s)', position: 'insideBottomRight', offset: -5 }}
        />
        <YAxis
          label={{ value: 'Packets/s', angle: -90, position: 'insideLeft' }}
        />
        <Tooltip />
        <Line type="monotone" dataKey="count" name="Throughput (packets/s)" stroke="#8884d8" />
      </LineChart>
    </Box>
  );
};

export default ThroughputGraph;
