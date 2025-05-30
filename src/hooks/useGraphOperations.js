import { useCallback } from 'react';
import { addEdge } from '@xyflow/react';
import { getEdgeColor } from '../utils/colors';
import { ConnectionLineType } from '@xyflow/react';
import { calculateNodeWidth } from '../utils/graphUtils';

export const useGraphOperations = (nodes, setNodes, setEdges, updateNodeInternals) => {
  const updateNodeHandles = useCallback((nodeId, newInputs, newOutputs) => {
    const newWidth = calculateNodeWidth(nodeId, newInputs, newOutputs);
    setNodes((currentNodes) =>
      currentNodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              inputs: newInputs,
              outputs: newOutputs,
            },
            style: {
              ...node.style,
              width: newWidth,
            },
          };
        }
        return node;
      })
    );
    updateNodeInternals(nodeId);
  }, [setNodes, updateNodeInternals]);

  const onConnect = useCallback((connection) => {
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);

    const sourceHandleIndex = parseInt(connection.sourceHandle.split('-')[2], 10);
    const targetHandleIndex = parseInt(connection.targetHandle.split('-')[2], 10);

    if (
      sourceHandleIndex >= sourceNode.data.outputs ||
      targetHandleIndex >= targetNode.data.inputs
    ) {
      console.warn('Handle index out of range');
      return;
    }
    const edgeColor = getEdgeColor();

    const newEdge = {
      ...connection,
      id: `e${connection.source}-${connection.target}-${Date.now()}`,
      type: ConnectionLineType.SmoothStep,
      animated: false,
      style: {
        stroke: edgeColor,
        strokeWidth: 2,
      },
      zIndex: 2000,
    };

    setEdges((existingEdges) => {
      const isSourcePortConnected = existingEdges.some(
        (edge) =>
          edge.source === connection.source && edge.sourceHandle === connection.sourceHandle
      );

      const isTargetPortConnected = existingEdges.some(
        (edge) =>
          edge.target === connection.target && edge.targetHandle === connection.targetHandle
      );

      if (isSourcePortConnected || isTargetPortConnected) {
        return existingEdges;
      }

      return addEdge(newEdge, existingEdges);
    });
  }, [nodes, setEdges]);

  return {
    updateNodeHandles,
    onConnect
  };
};