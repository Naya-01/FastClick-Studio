import { getLayoutedElements } from './layoutUtils';

export const handleData = (pairs) => {
  const nodeMap = new Map();
  const outputHandleCounter = {};
  const inputHandleCounter = {};

  pairs.forEach((pair) => {
    if (!nodeMap.has(pair.source)) {
      nodeMap.set(pair.source, { id: pair.source, inputs: 0, outputs: 1 });
    } else {
      nodeMap.get(pair.source).outputs += 1;
    }

    if (!nodeMap.has(pair.destination)) {
      nodeMap.set(pair.destination, { id: pair.destination, inputs: 1, outputs: 0 });
    } else {
      nodeMap.get(pair.destination).inputs += 1;
    }
  });

  const parsedNodes = Array.from(nodeMap.values()).map((nodeData) => ({
    id: nodeData.id,
    data: {
      label: nodeData.id,
      inputs: nodeData.inputs,
      outputs: nodeData.outputs,
    },
    position: { x: 0, y: 0 },
    type: 'dynamicHandlesNode',
    style: {
      border: '1px solid #004085',
      padding: 10,
      borderRadius: 5,
      backgroundColor: '#cce5ff',
    },
  }));

  Object.keys(outputHandleCounter).forEach((key) => (outputHandleCounter[key] = 0));
  Object.keys(inputHandleCounter).forEach((key) => (inputHandleCounter[key] = 0));

  const getOutputHandleIndex = (nodeId) => {
    if (!outputHandleCounter[nodeId]) outputHandleCounter[nodeId] = 0;
    return outputHandleCounter[nodeId]++;
  };

  const getInputHandleIndex = (nodeId) => {
    if (!inputHandleCounter[nodeId]) inputHandleCounter[nodeId] = 0;
    return inputHandleCounter[nodeId]++;
  };

  const parsedEdges = pairs.map((pair, index) => ({
    id: `e${pair.source}-${pair.destination}-${index}`,
    source: pair.source,
    target: pair.destination,
    sourceHandle: `output-handle-${getOutputHandleIndex(pair.source)}`,
    targetHandle: `input-handle-${getInputHandleIndex(pair.destination)}`,
    type: 'smoothstep',
    animated: true,
  }));

  return getLayoutedElements(parsedNodes, parsedEdges);
};
