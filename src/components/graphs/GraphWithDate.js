import React from 'react';
import { Box, Text } from '@chakra-ui/react';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

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
  chartHeight = 650,
  margin = { top: 20, right: 30, bottom: 150, left: 100 }
}) => {

  const rawDomain = computeDomain();
  const fixedDomain = [Math.max(0, rawDomain[0]), rawDomain[1]];
  const limit = 10;
  const tickInterval = data.length > limit ? Math.floor(data.length / limit ) : 0;

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
            dy: 25,
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
      </AreaChart>
    </Box>
  );
};

export default GraphWithDate;
