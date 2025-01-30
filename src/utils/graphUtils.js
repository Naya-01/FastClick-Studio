import { getLayoutedElements } from './layoutUtils';
import { ConnectionLineType, MarkerType } from '@xyflow/react';


export const calculateNodeWidth = (label, inputs, outputs) => {
  const baseWidth = 100;
  const textWidth = label.length * 13;
  const portWidth = 30 * Math.max(inputs, outputs);

  return Math.max(baseWidth, textWidth, baseWidth + portWidth);
};

export const handleData = (pairs) => {
  const nodeMap = new Map();
  const outputHandleCounter = {};
  const inputHandleCounter = {};

  const sortedPairs = [...pairs].sort((a, b) => {
    const aPort = a.sourcePort ?? 0;
    const bPort = b.sourcePort ?? 0;
    return aPort - bPort;
  });

  sortedPairs.forEach((pair) => {
    if (!nodeMap.has(pair.source)) {
      nodeMap.set(pair.source, { id: pair.source, inputs: 0, outputs: 0 });
    }

    if (pair.destination !== null) {
      nodeMap.get(pair.source).outputs += 1;

      if (!nodeMap.has(pair.destination)) {
        nodeMap.set(pair.destination, { id: pair.destination, inputs: 0, outputs: 0 });
      }

      nodeMap.get(pair.destination).inputs += 1;
    }
  });

  const parsedNodes = Array.from(nodeMap.values()).map((nodeData) => {
    const nodeWidth = calculateNodeWidth(nodeData.id, nodeData.inputs, nodeData.outputs);

    return {
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
        width: `${nodeWidth}px`,
      },
    };
  });

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

  const parsedEdges = sortedPairs
    .filter((pair) => pair.destination !== null)
    .map((pair, index) => ({
      id: `e${pair.source}-${pair.destination}-${index}`,
      source: pair.source,
      target: pair.destination,
      sourceHandle: `output-handle-${getOutputHandleIndex(pair.source)}`,
      targetHandle: `input-handle-${getInputHandleIndex(pair.destination)}`,
      type: ConnectionLineType.SmoothStep,
      animated: true,
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: '#004085',
      },
      style: { stroke: '#004085', strokeWidth: 2 },
      zIndex: 2000,
    }));

  let resp = getLayoutedElements(parsedNodes, parsedEdges).then((layout) => {
    return layout;
  });

  return resp;
};
