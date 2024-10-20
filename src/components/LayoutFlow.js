import React, { useState, useEffect, useCallback } from 'react';
import {
  ReactFlow,
  addEdge,
  ConnectionLineType,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ChakraProvider, Box } from '@chakra-ui/react';
import { handleData } from '../utils/graphUtils';
import NodeListSidebar from './NodeListSidebar';
import NodeDetailsModal from './NodeDetailsModal';
import DynamicHandlesNode from './DynamicHandlesNode';
import { WebsocketService } from '../services/webSocketService';
import { RouterTreeModel } from '../models/router-tree-model';
import { lespairs } from '../data/pairs';

const nodeTypes = {
  dynamicHandlesNode: DynamicHandlesNode,
};

const LayoutFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const webSocketService = new WebsocketService();


  useEffect(() => {
    const fetchData = () => {
      try {
        const subscription = webSocketService.getFlatConfig().subscribe((configData) => {
          const routerTreeModel = new RouterTreeModel(configData);
          const pairs = routerTreeModel.getAllPairs();
          const { nodes: layoutedNodes, edges: layoutedEdges } = handleData(pairs);
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);
          });
        return () => subscription.unsubscribe();
  
        // const { nodes: layoutedNodes, edges: layoutedEdges } = handleData(lespairs);
        // setNodes(layoutedNodes);
        // setEdges(layoutedEdges);
      } catch (error) {
        console.error("Failed to connect to Click, using fallback data", error);
      }
    };
    fetchData();
  }, []);
  

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: ConnectionLineType.SmoothStep,
            animated: true,
          },
          eds
        )
      );
    },
    [setEdges]
  );

  const openModal = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  return (
    <ChakraProvider>
      <Box display="flex" width="100%" height="100vh">
        <NodeListSidebar nodes={nodes} onNodeClick={openModal} />
        <Box flex="1" height="100%" pr="250px">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            fitView
            style={{ width: '100%', height: '100%' }}
          >
            <Background />
            <Controls showInteractive={false} />
            <MiniMap />
          </ReactFlow>
        </Box>
      </Box>

      <NodeDetailsModal isOpen={isModalOpen} onClose={closeModal} selectedNode={selectedNode} />
    </ChakraProvider>
  );
};

export default LayoutFlow;
