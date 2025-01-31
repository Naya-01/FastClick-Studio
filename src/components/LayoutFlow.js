import React, { useState, useEffect, useRef, useCallback } from 'react';
import { toSvg } from 'html-to-image';
import { useNavigate } from 'react-router-dom';
import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  useUpdateNodeInternals,
  useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { 
  Box,
} from '@chakra-ui/react';
import { handleData, calculateNodeWidth } from '../utils/graphUtils';
import NodeListSidebar from './NodeListSidebar';
import NodeDetailsModal from './NodeDetailsModal';
import DynamicHandlesNode from './DynamicHandlesNode';
import { WebsocketService } from '../services/webSocketService';
import { RouterTreeModel } from '../models/router-tree-model';
import { lespairs } from '../data/pairs';
import ContextMenu from './ContextMenu';
import NodeModal from './NodeModal';
import { useGraphOperations } from '../hooks/useGraphOperations';
import { useClickConfig } from '../hooks/useClickConfig';
import { GraphControls } from './GraphControls';
import { DragPanel } from './DragPanel';
import { useAlert } from '../context/AlertContext';

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
  const reactFlowWrapper = useRef(null);
  const updateNodeInternals = useUpdateNodeInternals();
  const [newNodePosition, setNewNodePosition] = useState({ x: 0, y: 0 });
  const [isEditNodeModalOpen, setIsEditNodeModalOpen] = useState(false);
  const [editNodeData, setEditNodeData] = useState(null);
  const [connectionError, setConnectionError] = useState(false);
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { screenToFlowPosition } = useReactFlow();


  const webSocketService = new WebsocketService();

  const { updateNodeHandles, onConnect } = useGraphOperations(
    nodes, 
    setNodes, 
    setEdges, 
    updateNodeInternals
  );

  const { generateClickConfig } = useClickConfig(nodes, edges, router);


  const fetchData = () => {
      const subscription = webSocketService.getFlatConfig().subscribe({
        next: (configData) => {
          const routerTreeModel = new RouterTreeModel(configData);
          setRouter(routerTreeModel);
          const pairs = routerTreeModel.getAllPairs();
  
          handleData(pairs, routerTreeModel).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
            setNodes(layoutedNodes);
            setEdges(layoutedEdges);
          });
        },
        error: (error) => {
          setConnectionError(true);
        },
      });
      return () => subscription.unsubscribe();
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (connectionError) {
      showAlert(
        'Connection Error',
        'The connection to the server has been lost. Please check your network.',
        'error'
      );
      navigate('/');
      setConnectionError(false);
    }
  }, [connectionError, navigate, showAlert]);

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

  const handleAddNode = (newNode) => {
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
      position: newNodePosition,
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
  };
  
  const onContextMenu = useCallback(
    (event, element, type) => {
      event.preventDefault();
  
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
  
      setContextMenu({
        id: element.id,
        type,
        top: position.y,
        left: position.x,
      });
    },
    [setContextMenu]
  );
  

  const onPaneClick = useCallback(() => {
    setContextMenu(null);
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      setNewNodePosition(position);
      setIsAddNodeModalOpen(true);
    },
    [screenToFlowPosition]
  );

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleEditNode = (updatedNode, oldId) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id !== oldId) return node;

        const cleanedNode = {
          ...updatedNode,
          id: updatedNode.id.trim(),
          type: updatedNode.type.trim(),
          configuration: updatedNode.configuration.trim(),
          inputs: Math.max(0, updatedNode.inputs),
          outputs: Math.max(0, updatedNode.outputs),
        };
  
        const newWidth = calculateNodeWidth(cleanedNode.id, cleanedNode.inputs, cleanedNode.outputs);
        const isNodeInRouter = router.getElement(cleanedNode.id) !== undefined;
  
        return {
          ...node,
          id: cleanedNode.id,
          data: {
            ...node.data,
            label: cleanedNode.id,
            type: cleanedNode.type,
            configuration: cleanedNode.configuration,
            inputs: cleanedNode.inputs,
            outputs: cleanedNode.outputs,
          },
          style: {
            ...node.style,
            border: isNodeInRouter ? '1px solid #004085' : '1px solid #28a745',
            backgroundColor: isNodeInRouter ? '#cce5ff' : '#d4edda',
            width: `${newWidth}px`,
          },
        };
      })
    );


    setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        if (edge.source === oldId) {
          return { ...edge, source: updatedNode.id };
        }
        if (edge.target === oldId) {
          return { ...edge, target: updatedNode.id };
        }
        return edge;
      })
    );
  
    setIsEditNodeModalOpen(false);
    setEditNodeData(null);
  };
  
  
  const openEditModal = (nodeId) => {
    const node = nodes.find((n) => n.id === nodeId);
    setEditNodeData({
      id: node.id,
      type: node.data.type,
      configuration: node.data.configuration,
      inputs: node.data.inputs,
      outputs: node.data.outputs,
    });
    setIsEditNodeModalOpen(true);
  };
  
  return (
    <>
      <Box display="flex" width="100%" height="100vh" position="relative">
        <DragPanel />
        <NodeListSidebar nodes={nodes} onNodeClick={openModal} router={router} />
        <Box flex="1" height="100%" pr="250px" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onConnect={onConnect}
            onNodeContextMenu={(event, node) => onContextMenu(event, node, 'node')}
            onEdgeContextMenu={(event, edge) => onContextMenu(event, edge, 'edge')}
            onPaneClick={onPaneClick}
            onDrop={onDrop}
            onDragOver={onDragOver}
            fitView
            style={{ width: '100%', height: '100%' }}
          >
            <Background color="#f0f0f0" gap={16} />
            <Controls showInteractive={false} />
            <MiniMap />
            {contextMenu && <ContextMenu 
              {...contextMenu} 
              nodes={nodes}
              setNodes={setNodes} 
              setEdges={setEdges} 
              setContextMenu={setContextMenu}
              updateNodeHandles={updateNodeHandles}
              onNodeClick={openModal}
              onEditNode={openEditModal}
            />}
          </ReactFlow>
        </Box>

        <GraphControls 
          onDownloadImage={handleDownloadImage}
          onGenerateConfig={generateClickConfig}
        />
      </Box>

      <NodeModal 
        isOpen={isAddNodeModalOpen} 
        onClose={() => setIsAddNodeModalOpen(false)} 
        onConfirm={handleAddNode} 
        initialNodeData={null} 
      />

      <NodeModal 
        isOpen={isEditNodeModalOpen} 
        onClose={() => setIsEditNodeModalOpen(false)} 
        onConfirm={handleEditNode} 
        initialNodeData={editNodeData} 
        isEdit={true} 
      />

      <NodeDetailsModal isOpen={isModalOpen} onClose={closeModal} selectedNode={selectedNode}/>
    </>
  );
};

export default LayoutFlow;
