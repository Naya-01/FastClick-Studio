import { useCallback } from 'react';
import { addEdge } from '@xyflow/react';

export const useGraphOperations = (nodes, setNodes, setEdges, updateNodeInternals) => {
  const updateNodeHandles = useCallback((nodeId, newInputs, newOutputs) => {
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

      return addEdge(connection, existingEdges);
    });
  }, [nodes, setEdges]);

  return {
    updateNodeHandles,
    onConnect
  };
};