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
  Handle,
  Position,
} from '@xyflow/react';
import dagre from '@dagrejs/dagre';
import '@xyflow/react/dist/style.css';
import { WebsocketService } from '../services/webSocketService';
import { RouterTreeModel } from '../models/router-tree-model';
import { Pair } from '../models/pair';
import DynamicHandlesNode from './nodes/DynamicHandlesNode';
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
  dynamicHandlesNode: DynamicHandlesNode,
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

  const outputHandleCounter = {};
  const inputHandleCounter = {};

  useEffect(() => {
    const fetchData = async () => {
      try {
        // const subscription = websocketService.getFlatConfig().subscribe((configData) => {
        //   const routerTreeModel = new RouterTreeModel(configData);
        //   const pairs = routerTreeModel.getAllPairs();
        //   handleData(pairs);
        // });

        // return () => subscription.unsubscribe();


        return handleData(lespairs);
      } catch (error) {
        console.error("Failed to connect to Click, using fallback data", error);
      }
    };

    const handleData = (pairs) => {
      const nodeMap = new Map();

      pairs.forEach((pair) => {
        if (!nodeMap.has(pair.source)) {
          nodeMap.set(pair.source, { id: pair.source, inputs: 0, outputs: 1 });
        } else {
          const node = nodeMap.get(pair.source);
          node.outputs += 1;
          nodeMap.set(pair.source, node);
        }

        if (!nodeMap.has(pair.destination)) {
          nodeMap.set(pair.destination, { id: pair.destination, inputs: 1, outputs: 0 });
        } else {
          const node = nodeMap.get(pair.destination);
          node.inputs += 1;
          nodeMap.set(pair.destination, node);
        }
      });

      const parsedNodes = Array.from(nodeMap.values()).map((nodeData) => ({
        id: nodeData.id,
        data: {
          label: nodeData.id,
          inputs: nodeData.inputs,
          outputs: nodeData.outputs,
          nodeWidth: nodeWidth,
          nodeHeight: nodeHeight,
        },
        position: { x: 0, y: 0 },
        type: 'dynamicHandlesNode',
        style: { border: '1px solid #004085', padding: 10, borderRadius: 5, backgroundColor: '#cce5ff' },
      }));

      // reset les compteurs de handles avant de créer les arêtes
      Object.keys(outputHandleCounter).forEach((key) => (outputHandleCounter[key] = 0));
      Object.keys(inputHandleCounter).forEach((key) => (inputHandleCounter[key] = 0));

      const parsedEdges = pairs.map((pair, index) => ({
        id: `e${pair.source}-${pair.destination}-${index}`,
        source: pair.source,
        target: pair.destination,
        sourceHandle: `output-handle-${getOutputHandleIndex(pair.source)}`,
        targetHandle: `input-handle-${getInputHandleIndex(pair.destination)}`,
        type: ConnectionLineType.SmoothStep,
        animated: true,
      }));


      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(parsedNodes, parsedEdges);
      setNodes([...layoutedNodes]);
      setEdges([...layoutedEdges]);
    };

    fetchData();
  }, []);

  const getOutputHandleIndex = (nodeId) => {
    if (!outputHandleCounter[nodeId]) {
      outputHandleCounter[nodeId] = 0;
    }
    return outputHandleCounter[nodeId]++;
  };

  const getInputHandleIndex = (nodeId) => {
    if (!inputHandleCounter[nodeId]) {
      inputHandleCounter[nodeId] = 0;
    }
    return inputHandleCounter[nodeId]++;
  };

  const onConnect = useCallback(
    (params) => {
      const { source, target } = params;
  
      const sourceHandleIndex = getOutputHandleIndex(source);
      const targetHandleIndex = getInputHandleIndex(target);
  
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            sourceHandle: `output-handle-${sourceHandleIndex}`,
            targetHandle: `input-handle-${targetHandleIndex}`,
            type: ConnectionLineType.SmoothStep,
            animated: true,
          },
          eds
        )
      );
  
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === source) {
            node.data = { ...node.data, outputs: node.data.outputs + 1 };
          }
          if (node.id === target) {
            node.data = { ...node.data, inputs: node.data.inputs + 1 };
          }
          return node;
        })
      );
    },
    [setEdges, setNodes]
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
                  <Button width="100%" justifyContent="flex-start">
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
            <Controls showInteractive={false} />
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
