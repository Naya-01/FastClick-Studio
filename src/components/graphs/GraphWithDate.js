import React, { useState, useEffect } from 'react';
import { Box, Text, Button, Flex } from '@chakra-ui/react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip, Brush } from 'recharts';

const GraphWithDate = ({
  title,
  data,
  xDataKey,
  xLabel,
  yDataKey,
  yLabel,
  computeDomain,
  lineName,
  stroke,
  chartWidth = 1000,
  chartHeight = 505 ,
  margin = { top: 20, right: 150, left: 100 },
  maxTicks = 10
}) => {

  const rawDomain = computeDomain();
  const fixedDomain = [Math.max(0, rawDomain[0]), rawDomain[1]];
  const tickInterval = data.length > maxTicks ? Math.floor(data.length / maxTicks) : 0;

  const [brushRange, setBrushRange] = useState({ startIndex: 0, endIndex: data.length - 1 });

  useEffect(() => {
    setBrushRange(prevRange => {
      if (prevRange.startIndex === 0 && prevRange.endIndex === data.length - 2) {
        return { startIndex: 0, endIndex: data.length - 1 };
      }
      return prevRange;
    });
  }, [data.length]);

  const handleReset = () => {
    setBrushRange({ startIndex: 0, endIndex: data.length - 1 });
  };

  return (
    <Box mt={5}>
      <Text fontSize="lg" fontWeight="bold" mb={2}>
        {title}
      </Text>
      <AreaChart
        width={chartWidth}
        height={chartHeight}
        data={data}
        margin={margin}
      >
        <CartesianGrid stroke="#ccc" />
        <XAxis
          dataKey={xDataKey}
          interval={tickInterval}
          tick={{
            angle: -90,
            textAnchor: 'start',
            fontSize: 12,
            dy: 110,
            dx: -10,
          }}
          height={150}
          label={{
            value: xLabel,
            position: 'insideBottom',
            dy: 0,
          }}
        />
        <YAxis
          domain={fixedDomain}
          tickCount={6}
          tickFormatter={(value) => Number(value).toFixed(3)}
          label={{
            value: yLabel,
            angle: -90,
            position: 'insideLeft',
            dx: -70,
            style: { fontSize: 14 },
          }}
        />
        <Tooltip />
        <Area
          type="monotone"
          dataKey={yDataKey}
          name={lineName}
          stroke={stroke}
          fill={stroke}
          fillOpacity={0.2}
          baseValue={fixedDomain[0]}
          dot={{ r: 4 }}
        />
        <Brush
          dataKey={xDataKey}
          height={30}
          stroke={stroke}
          travellerWidth={5}
          startIndex={brushRange.startIndex}
          endIndex={brushRange.endIndex}
          onChange={(newRange) => setBrushRange(newRange)}
        />
      </AreaChart>
      <Flex justify="normal" mt={2} mr={margin.right / 2}>
          <Button size="sm" colorScheme="blue" onClick={handleReset}>
            Reset range
          </Button>
        </Flex>
    </Box>
  );
};

export default GraphWithDate;
