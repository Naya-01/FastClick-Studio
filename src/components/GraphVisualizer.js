import React, { useState, useEffect, useCallback } from 'react';
import { ReactFlow, addEdge, ConnectionLineType, useNodesState, useEdgesState, Background, Controls, MiniMap } from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import { WebsocketService } from '../services/webSocketService';
import { RouterTreeModel } from '../models/router-tree-model';
import '@xyflow/react/dist/style.css';
import { Pair } from '../models/pair';
import InputNode from './nodes/InputNode';
import OutputNode from './nodes/OutputNode';
import InputOutputNode from './nodes/InputOutputNode';
import {
  ChakraProvider,
  Box,
  List,
  ListItem,
  Button,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Tooltip,
} from '@chakra-ui/react';

const nodeTypes = {
  inputNode: InputNode,
  outputNode: OutputNode,
  inputOutputNode: InputOutputNode,
};

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 20;

const lespairs = [
  new Pair('FromDevice@1', 'Print@2'),
  new Pair('FromDevice@1', 'Host@6'),
  new Pair('FromDevice@1', 'Discard@4'),
  new Pair('Print@2', 'ToIPSummaryDump@3'),
  new Pair('ToIPSummaryDump@3', 'ToIPSummaryDumpLongLabel@3'),
  new Pair('ToIPSummaryDumpLongLabel@3', 'Discard@4'),
];

const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction, ranksep: 75 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - nodeWidth / 2,
      y: nodeWithPosition.y - nodeHeight / 2,
    };
    node.targetPosition = isHorizontal ? 'left' : 'top';
    node.sourcePosition = isHorizontal ? 'right' : 'bottom';
    node.draggable = true;
    return node;
  });

  return { nodes: layoutedNodes, edges };
};

const LayoutFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();


  
  const websocketService = new WebsocketService();

  useEffect(() => {
    const subscription = websocketService.getFlatConfig().subscribe((configData) => {
      const routerTreeModel = new RouterTreeModel(configData);
      const parsedNodes = [];
      const nodeSet = new Set();
      const pairs = lespairs;

      const connections = {};

      pairs.forEach((pair) => {
        if (!connections[pair.source]) {
          connections[pair.source] = { input: false, output: true };
        } else {
          connections[pair.source].output = true;
        }

        if (!connections[pair.destination]) {
          connections[pair.destination] = { input: true, output: false };
        } else {
          connections[pair.destination].input = true;
        }
      });

      pairs.forEach((pair) => {
        if (!nodeSet.has(pair.source)) {
          const isInputOutputNode = connections[pair.source].input && connections[pair.source].output;

          parsedNodes.push({
            id: pair.source,
            data: { label: pair.source, nodeWidth: nodeWidth, nodeHeight: nodeHeight },
            position: { x: 0, y: 0 },
            type: isInputOutputNode ? 'inputOutputNode' : 'outputNode',
            style: { border: '1px solid #004085', padding: 10, borderRadius: 5, backgroundColor: '#cce5ff' },
          });
          nodeSet.add(pair.source);
        }

        if (!nodeSet.has(pair.destination)) {
          const isInputOutputNode = connections[pair.destination].input && connections[pair.destination].output;

          parsedNodes.push({
            id: pair.destination,
            data: { label: pair.destination, nodeWidth: nodeWidth, nodeHeight: nodeHeight },
            position: { x: 0, y: 0 },
            type: isInputOutputNode ? 'inputOutputNode' : 'inputNode',
            style: { border: '1px solid #004085', padding: 10, borderRadius: 5, backgroundColor: '#cce5ff' },
          });
          nodeSet.add(pair.destination);
        }
      });

      const parsedEdges = pairs.map((pair) => ({
        id: `e${pair.source}-${pair.destination}`,
        source: pair.source,
        target: pair.destination,
        type: ConnectionLineType.SmoothStep,
        animated: true,
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(parsedNodes, parsedEdges);
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    });

    return () => subscription.unsubscribe();
  }, []);

  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, type: ConnectionLineType.SmoothStep, animated: true }, eds)
      ),
    []
  );

  const openModal = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    setSelectedNode(node);
    onOpen();
  };

  return (
    <ChakraProvider>
      <Box display="flex" width="100%" height="100vh">
        <Box
          width="250px"
          p="10px"
          borderLeft="1px solid #ccc"
          background="#f9f9f9"
          overflowY="auto"
          position="fixed"
          right="0"
          top="0"
          bottom="0"
        >
          <List spacing={3}>
            {nodes.map((node) => (
              <Tooltip label={node.data.label} key={node.id}>
                <ListItem
                  key={node.id}
                  cursor="pointer"
                  onClick={() => openModal(node.id)}
                  whiteSpace="nowrap"
                  overflow="hidden"
                  textOverflow="ellipsis"
                >
                  <Button 
                  width="100%"
                  justifyContent="flex-start"
                  >
                    {node.data.label}
                  </Button>
                </ListItem>
              </Tooltip>
            ))}
          </List>
        </Box>

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
            <Controls 
              showInteractive={false}
            />
            <MiniMap />
          </ReactFlow>
        </Box>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Node Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedNode ? (
              <>
                <p>Label: {selectedNode.data.label}</p>
                <p>Node ID: {selectedNode.id}</p>
                <p>Type: {selectedNode.type}</p>
              </>
            ) : null}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </ChakraProvider>
  );
};

export default LayoutFlow;
