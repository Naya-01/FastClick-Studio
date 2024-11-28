import React, { useState, useEffect, useRef, useCallback  } from 'react';
import { toSvg } from 'html-to-image';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { ChakraProvider, Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, Input, Select } from '@chakra-ui/react';
import { handleData, calculateNodeWidth } from '../utils/graphUtils';
import NodeListSidebar from './NodeListSidebar';
import NodeDetailsModal from './NodeDetailsModal';
import DynamicHandlesNode from './DynamicHandlesNode';
import { WebsocketService } from '../services/webSocketService';
import { RouterTreeModel } from '../models/router-tree-model';
import { lespairs } from '../data/pairs';
import ContextMenu from './ContextMenu';

const nodeTypes = {
  dynamicHandlesNode: DynamicHandlesNode,
};

const LayoutFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [router, setRouter] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [isAddNodeModalOpen, setIsAddNodeModalOpen] = useState(false);
  const [newNode, setNewNode] = useState({ id: '', type: '', configuration: '', inputs: 1, outputs: 1 });
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
      //const element = false;
      console.log("node", node);
      if (element) {
        return `${node.id} :: ${element.type}(${element.configuration || ''});`;
      } else {
        return `${node.id} :: ${node.data.type || 'Node'}(${node.data.configuration || ''});`;
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

  const handleAddNode = () => {
    const newNodeWidth = calculateNodeWidth(newNode.id, newNode.inputs, newNode.outputs);
  
    const newNodeConfig = {
      id: newNode.id,
      data: {
        label: newNode.id,
        inputs: newNode.inputs,
        outputs: newNode.outputs,
        type: newNode.type,
        configuration: newNode.configuration,
      },
      position: { x: 250, y: 150 },
      type: 'dynamicHandlesNode',
      style: {
        border: '1px solid #28a745',
        padding: 10,
        borderRadius: 5,
        backgroundColor: '#d4edda',
        width: `${newNodeWidth}px`, 
      },
    };
  
    setNodes((prevNodes) => [...prevNodes, newNodeConfig]);
    setIsAddNodeModalOpen(false);
    setNewNode({ id: '', type: '', configuration: '', inputs: 1, outputs: 1 });
  };

  const onConnect = (connection) => {
    setEdges((eds) => addEdge(connection, eds));
  };

  const onNodeContextMenu = useCallback(
    (event, node) => {
      event.preventDefault();
      const wrapperBounds = reactFlowWrapper.current.getBoundingClientRect();

      setContextMenu({
        id: node.id,
        type: 'node',
        top: event.clientY < wrapperBounds.height - 100 ? event.clientY : null,
        left: event.clientX < wrapperBounds.width - 100 ? event.clientX : null,
        bottom: event.clientY >= wrapperBounds.height - 100 ? wrapperBounds.height - event.clientY : null,
        right: event.clientX >= wrapperBounds.width - 100 ? wrapperBounds.width - event.clientX : null,
      });
    },
    [setContextMenu]
  );

  const onEdgeContextMenu = useCallback(
    (event, edge) => {
      event.preventDefault();
      const wrapperBounds = reactFlowWrapper.current.getBoundingClientRect();

      setContextMenu({
        id: edge.id,
        type: 'edge',
        top: event.clientY < wrapperBounds.height - 100 ? event.clientY : null,
        left: event.clientX < wrapperBounds.width - 100 ? event.clientX : null,
        bottom: event.clientY >= wrapperBounds.height - 100 ? wrapperBounds.height - event.clientY : null,
        right: event.clientX >= wrapperBounds.width - 100 ? wrapperBounds.width - event.clientX : null,
      });
    },
    [setContextMenu]
  );

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

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
            onConnect={onConnect}
            onNodeContextMenu={onNodeContextMenu}
            onEdgeContextMenu={onEdgeContextMenu}
            onPaneClick={onPaneClick}
            fitView
            style={{ width: '100%', height: '100%' }}
          >
            <Background color="#f0f0f0" gap={16} />
            <Controls showInteractive={false} />
            <MiniMap />
            {contextMenu && <ContextMenu {...contextMenu} setNodes={setNodes} setEdges={setEdges} setContextMenu={setContextMenu}/>}
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

        <Button
          onClick={() => setIsAddNodeModalOpen(true)}
          position="absolute"
          top="10px"
          right="700px"
          colorScheme="teal"
          zIndex="10"
        >
          Add Node
        </Button>
      </Box>

            {/* Modal for Adding Node */}
            <Modal isOpen={isAddNodeModalOpen} onClose={() => setIsAddNodeModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Node</ModalHeader>
          <ModalBody>
            <Input
              placeholder="Node Name"
              value={newNode.id}
              onChange={(e) => setNewNode({ ...newNode, id: e.target.value })}
              mb={3}
            />
            <Input
              placeholder="Node Class"
              value={newNode.type}
              onChange={(e) => setNewNode({ ...newNode, type: e.target.value })}
              mb={3}
            />
            <Input
              placeholder="Configuration"
              value={newNode.configuration}
              onChange={(e) => setNewNode({ ...newNode, configuration: e.target.value })}
              mb={3}
            />
            <Input
              type="number"
              placeholder="Inputs"
              value={newNode.inputs}
              onChange={(e) => setNewNode({ ...newNode, inputs: Number(e.target.value) })}
              mb={3}
            />
            <Input
              type="number"
              placeholder="Outputs"
              value={newNode.outputs}
              onChange={(e) => setNewNode({ ...newNode, outputs: Number(e.target.value) })}
              mb={3}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" onClick={handleAddNode}>
              Add Node
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <NodeDetailsModal isOpen={isModalOpen} onClose={closeModal} selectedNode={selectedNode} />
    </ChakraProvider>
  );
};

export default LayoutFlow;
