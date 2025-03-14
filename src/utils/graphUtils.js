import { getLayoutedElements } from './layoutUtils';
import { ConnectionLineType } from '@xyflow/react';
import { getLiveBorderColor, getLiveColor, getEdgeColor } from '../utils/colors';


export const computeDomain = (datas, field) => {
  if (datas.length === 0) return [0, 1];
  
  if (datas.length === 1) {
    const value = datas[0][field];
    const delta = value > 0 ? value * 0.1 : 1;
    return [value, value + delta];
  }
  const values = datas.map(d => d[field]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === Infinity || max === -Infinity || isNaN(min) || isNaN(max)) return [0, 1];
  const margin = (max - min) * 0.1;
  return [Math.max(0, min - margin), max + margin];
};

export const getAdjustedCoordinates = (event, wrapperRef) => {
  const wrapperBounds = wrapperRef.current.getBoundingClientRect();
  const transform = wrapperRef.current.querySelector('.react-flow__viewport').style.transform;

  const match = transform.match(/matrix\(([^,]+),[^,]+,[^,]+,[^,]+,([^,]+),([^,]+)\)/);
  const scale = match ? parseFloat(match[1]) : 1;
  const offsetX = match ? parseFloat(match[2]) : 0;
  const offsetY = match ? parseFloat(match[3]) : 0;

  const adjustedX = (event.clientX - wrapperBounds.left - offsetX) / scale;
  const adjustedY = (event.clientY - wrapperBounds.top - offsetY) / scale;

  return { x: adjustedX, y: adjustedY };
};

export const calculateNodeWidth = (label, inputs, outputs) => {
  const baseWidth = 100;
  const textWidth = label.length * 13;
  const portWidth = 30 * Math.max(inputs, outputs);

  return Math.max(baseWidth, textWidth, baseWidth + portWidth);
};

export const handleData = (pairs, router) => {
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

    const element = router.getElement(nodeData.id);
    return {
      id: nodeData.id,
      data: {
        label: nodeData.id,
        inputs: nodeData.inputs,
        outputs: nodeData.outputs,
        type: element.type,
        configuration: element.configuration,
      },
      position: { x: 0, y: 0 },
      type: 'dynamicHandlesNode',
      style: {
        border: `1px solid ${getLiveBorderColor()}`,
        padding: 10,
        borderRadius: 5,
        backgroundColor: `${getLiveColor()}`,
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
    .map((pair, index) => {
      const outputHandleIndex = getOutputHandleIndex(pair.source);
      const inputHandleIndex = getInputHandleIndex(pair.destination);

      const edgeColor = getEdgeColor();

      return {
        id: `e${pair.source}-${pair.destination}-${index}`,
        source: pair.source,
        target: pair.destination,
        sourceHandle: `output-handle-${outputHandleIndex}`,
        targetHandle: `input-handle-${inputHandleIndex}`,
        type: ConnectionLineType.SmoothStep,
        animated: true,
        style: { 
          stroke: edgeColor,
          strokeWidth: 2,
        },
        zIndex: 2000,
      };
    });


  let resp = getLayoutedElements(parsedNodes, parsedEdges).then((layout) => {
    return layout;
  });

  return resp;
};
