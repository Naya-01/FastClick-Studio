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
  Button,
  Input
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
import DragPanel from './DragPanel';
import { useAlert } from '../context/AlertContext';
import {getLiveColor, getAddColor, getLiveBorderColor, getAddBorderColor} from '../utils/colors';
import ProposalEdge from './ProposalEdge';
import {getLayoutedElements} from '../utils/layoutUtils';
import { useClasses } from '../context/ClassesContext';

const edgeTypes = {
  proposalEdge: ProposalEdge,
};

const nodeTypes = {
  dynamicHandlesNode: DynamicHandlesNode,
};

const LayoutFlow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [configUpdated, setConfigUpdated] = useState(false);
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
  const { screenToFlowPosition, setCenter } = useReactFlow();
  const nodesRef = useRef([]);
  const [isAddElementModalOpen, setIsAddElementModalOpen] = useState(false);
  const [pendingEdgeId, setPendingEdgeId] = useState(null);
  const [newElementName, setNewElementName] = useState('');

  const { classesData } = useClasses();

  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const webSocketService = new WebsocketService();

  const { updateNodeHandles, onConnect } = useGraphOperations(
    nodes, 
    setNodes, 
    setEdges, 
    updateNodeInternals
  );

  const { generateClickConfig } = useClickConfig(nodes, edges, router, setConnectionError, setConfigUpdated);

  const fetchData = async () => {
      const subscription = webSocketService.getFlatConfig().subscribe({
        next: async (configData) => {
          const routerTreeModel = new RouterTreeModel(configData);
          await routerTreeModel.fetchHandlersForElementsAsync();
          setRouter(routerTreeModel);
          const pairs = routerTreeModel.getAllPairs();
  
          handleData(pairs, routerTreeModel).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
            const edgesWithProposal = layoutedEdges.map((edge) => {
              return {
                ...edge,
                type: 'proposalEdge',
                data: {
                  onAddCounter: handleAddElement,
                },
              };
            });
          
            setNodes(layoutedNodes);
            setEdges(edgesWithProposal);
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
    if (configUpdated) {
      fetchData();
      setConfigUpdated(false);
      showAlert('Configuration Updated', 'The configuration has been updated successfully.', 'success');
    }
  }, [configUpdated]);

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


  const handleAddElementCancel = () => {
    setIsAddElementModalOpen(false);
    setPendingEdgeId(null);
  };

  const handleAddElement = useCallback((edgeId) => {
    setPendingEdgeId(edgeId);
    setNewElementName('');
    setIsAddElementModalOpen(true);
  }, []);

  const handleAddElementConfirm = () => {
    console.log("Adding element", newElementName);
    setEdges((prevEdges) => {
      const edgeToReplace = prevEdges.find((e) => e.id === pendingEdgeId);
      if (!edgeToReplace) return prevEdges;
  
      const {
        source,
        target,
        sourceHandle,
        targetHandle,
        style,
        type,
        animated,
        zIndex,
      } = edgeToReplace;

      const sourceNode = nodesRef.current.find((n) => n.id === source);
      const targetNode = nodesRef.current.find((n) => n.id === target);
  
      if (!sourceNode || !targetNode) {
        return prevEdges;
      }
  
      const midX = (sourceNode.position.x + targetNode.position.x) / 2;
      const midY = (sourceNode.position.y + targetNode.position.y) / 2;
  
      const newNodeId = `${newElementName}_${source}_${target}`;
      const newNode = {
        id: newNodeId,
        type: `${newElementName}`,
        inputs: 1,
        outputs: 1,
        configuration: '',
      };
  
      handleAddNode(newNode, { x: midX, y: midY });
  
      const updatedEdges = prevEdges.filter((e) => e.id !== pendingEdgeId);
  
      const edge1Id = `e${source}-${newNodeId}-${Date.now()}-1`;
      const newEdge1 = {
        ...edgeToReplace,
        id: edge1Id,
        source,
        target: newNodeId,
        sourceHandle,
        targetHandle: 'input-handle-0',
        style: style,
        type: type,
        animated: animated,
        zIndex: zIndex,
      };
  
      const edge2Id = `e${newNodeId}-${target}-${Date.now()}-2`;
      const newEdge2 = {
        ...edgeToReplace,
        id: edge2Id,
        source: newNodeId,
        target,
        sourceHandle: 'output-handle-0',
        targetHandle,
        style: style,
        type: type,
        animated: animated,
        zIndex: zIndex,
      };
  
      updatedEdges.push(newEdge1, newEdge2);
      return updatedEdges;
    });
    setIsAddElementModalOpen(false);
    setPendingEdgeId(null);
  };

  const handleAddNode = (newNode, forcedPosition = null) => {
    const newNodeWidth = calculateNodeWidth(newNode.id, newNode.inputs, newNode.outputs);
    const finalPosition = forcedPosition ?? newNodePosition; 
  
    const newNodeConfig = {
      id: newNode.id,
      data: {
        label: newNode.id,
        inputs: newNode.inputs,
        outputs: newNode.outputs,
        type: newNode.type,
        configuration: newNode.configuration,
      },
      position: finalPosition,
      type: 'dynamicHandlesNode',
      style: {
        border: `1px solid ${getAddBorderColor()}`,
        padding: 10,
        borderRadius: 5,
        backgroundColor: `${getAddColor()}`,
        width: `${newNodeWidth}px`, 
      },
    };
  
    setNodes((prevNodes) => [...prevNodes, newNodeConfig]);
  };

  const getAdjustedCoordinates = (event, wrapperRef) => {
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
  
  const onContextMenu = useCallback(
    (event, element, type) => {
      event.preventDefault();
  
      const { x, y } = getAdjustedCoordinates(event, reactFlowWrapper);
  
      setContextMenu({
        id: element.id,
        type,
        top: y,
        left: x,
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

      const elementData = JSON.parse(event.dataTransfer.getData('application/reactflow'));

      setEditNodeData({
        id: '',
        type: elementData.name || '',
        configuration: '',
        inputs: elementData.inputs,
        outputs: elementData.outputs,
      });

      setNewNodePosition(position);
      setIsAddNodeModalOpen(true);
    },
    [screenToFlowPosition]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  });

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
            border: isNodeInRouter ? `1px solid ${getLiveBorderColor()}` : `1px solid ${getAddBorderColor()}`,
            backgroundColor: isNodeInRouter ? `${getLiveColor()}` : `${getAddColor()}`,
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
  
  const handleReorganizeNodes = async () => {
    const resetNodes = nodesRef.current.map((node) => ({
      ...node,
      position: { x: 0, y: 0 },
    }));
    const layout = await getLayoutedElements(resetNodes, edges);
    setNodes(layout.nodes);
    setEdges(layout.edges);
  };

  const handleTargetNode = useCallback((id) => {
    const node = nodes.find(n => n.id === id);
    if (node && node.position && node.style) {
      const nodeWidth = parseFloat(node.style.width) || 0;
      const node_height = parseFloat(node.style.height) || 0;
      const centerX = node.position.x + nodeWidth / 2;
      const centerY = node.position.y + node_height / 2;
      setCenter(centerX, centerY, { duration: 500 });
    }
  }, [nodes, setCenter]);
  
  return (
    <>
      <Box display="flex" width="100%" height="100vh" position="relative">
        <DragPanel />
        <NodeListSidebar 
          nodes={nodes} 
          onNodeClick={openModal} 
          router={router}
          onTargetNode={handleTargetNode} 
          />
        <Box flex="1" height="100%" pr="250px" ref={reactFlowWrapper}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
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
              router={router}
            />}
          </ReactFlow>
        </Box>

        <GraphControls 
          onDownloadImage={handleDownloadImage}
          onGenerateConfig={generateClickConfig}
          onReorganize={handleReorganizeNodes}
        />
      </Box>

      <NodeModal 
        isOpen={isAddNodeModalOpen} 
        onClose={() => setIsAddNodeModalOpen(false)} 
        onConfirm={handleAddNode} 
        initialNodeData={editNodeData} 
        router={router}
      />

      <NodeModal 
        isOpen={isEditNodeModalOpen} 
        onClose={() => setIsEditNodeModalOpen(false)} 
        onConfirm={handleEditNode} 
        initialNodeData={editNodeData} 
        isEdit={true} 
        router={router}
      />

      <NodeDetailsModal isOpen={isModalOpen} onClose={closeModal} selectedNode={selectedNode} router={router}/>

      {isAddElementModalOpen && (
        <Box
          position="fixed"
          top="50%"
          left="50%"
          transform="translate(-50%, -50%)"
          bg="white"
          p={4}
          boxShadow="lg"
          zIndex={1000}
          borderRadius="md"
          maxW="300px"
        >
          <Box mb={3}>
            <Input
              placeholder="Entrez le nom de l'élément"
              value={newElementName}
              onChange={(e) => setNewElementName(e.target.value)}
              isRequired
              list="classes-suggestions"
            />
            <datalist id="classes-suggestions">
              {classesData &&
                classesData.map((className) => (
                  <option key={className} value={className} />
                ))}
            </datalist>
          </Box>
          <Box display="flex" justifyContent="flex-end">
            <Button mr={2} onClick={handleAddElementCancel}>
              Annuler
            </Button>
            <Button colorScheme="blue" onClick={handleAddElementConfirm}>
              Confirmer
            </Button>
          </Box>
        </Box>
      )}
    </>
  );
};

export default LayoutFlow;
