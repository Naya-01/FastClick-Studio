import React, { useState, useEffect, useRef } from 'react';
import { toSvg } from 'html-to-image';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ChakraProvider, Box, Button } from '@chakra-ui/react';
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
  const [router, setRouter] = useState(null);
  const reactFlowWrapper = useRef(null);

  const webSocketService = new WebsocketService();


  const fetchData = () => {
    try {
      const subscription = webSocketService.getFlatConfig().subscribe((configData) => {
        const routerTreeModel = new RouterTreeModel(configData);
        setRouter(routerTreeModel);
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

  useEffect(() => {
    fetchData();
  }, []);

  const openModal = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    setSelectedNode(node);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNode(null);
  };

  const handleDownloadImage = () => {
    if (reactFlowWrapper.current) {
      toSvg(reactFlowWrapper.current, {
        filter: (node) => {
          return !node.classList?.contains('react-flow__minimap');
        },
        backgroundColor: '#ffffff',
      })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'graph.svg';
          link.href = dataUrl;
          link.click();
        })
        .catch((error) => {
          console.error("Could not download image", error);
        });
    }
  };

  const generateClickConfig = () => {
    const nodesConfig = nodes
    .map(node => {
      const element = router.getElement(node.id);
      if (element) {
        return `${node.id} :: ${element.type}(${element.configuration || ''});`;
      } else {
        return `${node.id} :: Node;`;
      }
    })
    .join('\n');

  const edgeMap = new Map();

  edges.forEach(edge => {
    if (!edgeMap.has(edge.source)) {
      edgeMap.set(edge.source, []);
    }
    edgeMap.get(edge.source).push(edge);
  });

  const edgesConfig = Array.from(edgeMap.entries())
    .map(([source, edges]) => {
      if (edges.length > 1) {
        return edges
          .map((edge, index) => `${source}[${index}] -> ${edge.target};`)
          .join('\n');
      } else {
        return `${source} -> ${edges[0].target};`;
      }
    })
    .join('\n');
    
      console.log(nodesConfig);
      console.log(edgesConfig);
  };

  return (
    <ChakraProvider>
      <Box display="flex" width="100%" height="100vh" position="relative">
        <NodeListSidebar nodes={nodes} onNodeClick={openModal} />
        <Box flex="1" height="100%" pr="250px" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            style={{ width: '100%', height: '100%' }}
          >
            <Background color="#f0f0f0" gap={16} />
            <Controls showInteractive={false} />
            <MiniMap />
          </ReactFlow>
        </Box>

        <Button
          onClick={handleDownloadImage}
          position="absolute"
          top="10px"
          right="270px"
          colorScheme="blue"
          zIndex="10"
        >
          Download Graph
        </Button>

        <Button
          onClick={generateClickConfig}
          position="absolute"
          top="10px"
          right="500px"
          colorScheme="green"
          zIndex="10"
        >
          Save as .click
        </Button>
      </Box>

      <NodeDetailsModal isOpen={isModalOpen} onClose={closeModal} selectedNode={selectedNode} />
    </ChakraProvider>
  );
};

export default LayoutFlow;
