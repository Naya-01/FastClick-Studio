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
  Spinner,
  Text,
  VStack,
} from '@chakra-ui/react';
import { handleData, calculateNodeWidth } from '../utils/graphUtils';
import NodeListSidebar from '../components/NodeListSidebar';
import NodeDetailsModal from '../components/NodeDetailsModal';
import DynamicHandlesNode from '../components/DynamicHandlesNode';
import { WebsocketService } from '../services/webSocketService';
import { RouterTreeModel } from '../models/router-tree-model';
import { lespairs } from '../data/pairs';
import ContextMenu from '../components/ContextMenu';
import NodeModal from '../components/NodeModal';
import { useGraphOperations } from '../hooks/useGraphOperations';
import { useClickConfig } from '../hooks/useClickConfig';
import { GraphControls } from '../components/GraphControls';
import DragPanel from '../components/DragPanel';
import { useAlert } from '../context/AlertContext';
import {
  getLiveColor,
  getAddColor,
  getLiveBorderColor,
  getAddBorderColor,
  getNodeColorByCount
} from '../utils/colors';
import ProposalEdge from '../components/ProposalEdge';
import {getLayoutedElements} from '../utils/layoutUtils';
import { useClasses } from '../context/ClassesContext';
import { lastValueFrom } from 'rxjs';
import AddElementModal from '../components/AddElementModal'

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
  const nodesRef = useRef(nodes);
  const edgesRef = useRef(edges);
  const [isAddElementModalOpen, setIsAddElementModalOpen] = useState(false);
  const [pendingEdgeId, setPendingEdgeId] = useState(null);
  const [newElementName, setNewElementName] = useState('');
  const [loading, setLoading] = useState(false);
  const [interv, setInterv] = useState(5); // in seconds
  const [colorsApplied, setColorsApplied] = useState(false);
  const lastReadingCountRef = useRef({});


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


  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);


  const propagateBackward = (nodesList, edgesList) => {

    const outCount = {};
    edgesList.forEach(edge => {
      outCount[edge.source] = (outCount[edge.source] || 0) + 1;
    });

    const nodeMap = {};
    nodesList.forEach(node => {
      nodeMap[node.id] = { ...node, style: { ...node.style } };
    });

    const visited = new Set();
    const terminalNodes = nodesList.filter(node => !edgesList.some(edge => edge.source === node.id));
    terminalNodes.forEach(terminal => {
      let current = terminal;
      while (true) {
        if (visited.has(current.id)) break;
        visited.add(current.id);

        const parentEdge = edgesList.find(edge => edge.target === current.id);
        if (!parentEdge) break;

        const parent = nodeMap[parentEdge.source];
        if (!parent) break;

        if ((parent.data.outputs || 0) > 1) break;
        
        parentEdge.style.stroke = parent.style.border.replace('1px solid ', '');
        parent.style.backgroundColor = current.style.backgroundColor;
        parent.style.border = current.style.border;
        current = parent;
      }
    });
    return Object.values(nodeMap);
  };
  
  const propagateForward = (nodesList, edgesList) => {

    const nodeMap = {};
    nodesList.forEach(node => {
      nodeMap[node.id] = { ...node, style: { ...node.style } };
    });

    const visited = new Set();
    const sourceNodes = nodesList.filter(node => !edgesList.some(edge => edge.target === node.id));
    sourceNodes.forEach(source => {
      let current = source;
      while (true) {
        if (visited.has(current.id)) break;
        visited.add(current.id);

        const childEdge = edgesList.find(edge => edge.source === current.id);
        if (!childEdge) break;

        const child = nodeMap[childEdge.target];
        if (!child) break;

        if ((current.data.outputs || 0) > 1 || (current.data.inputs || 0) > 1) break;

        child.style.backgroundColor = current.style.backgroundColor;
        child.style.border = current.style.border;
        current = child;
      }
    });
    return Object.values(nodeMap);
  };
  
  const propagateMix = (nodesList, edgesList) => {
    const nodeMap = {};
    nodesList.forEach(node => {
      nodeMap[node.id] = { 
        ...node, 
        data: { ...node.data },
        style: { ...node.style }
      };
    });
    
    const visitedBackward = new Set();
    const visitedForward = new Set();
    
    const backwardNodes = (nodeId) => {
      if (visitedBackward.has(nodeId)) return;

      visitedBackward.add(nodeId);
      const parentEdge = edgesList.find(edge => edge.target === nodeId);

      if (!parentEdge) return;

      const parentId = parentEdge.source;

      if (nodeMap[parentId].data.outputs > 1) return;

      nodeMap[parentId].style.backgroundColor = nodeMap[nodeId].style.backgroundColor;
      nodeMap[parentId].style.border = nodeMap[nodeId].style.border;
      backwardNodes(parentId);
    };
    
    const forwardNodes = (nodeId) => {
      if (visitedForward.has(nodeId)) return;

      visitedForward.add(nodeId);
      const childEdge = edgesList.find(edge => edge.source === nodeId);

      if (!childEdge) return;

      const childId = childEdge.target;

      nodeMap[childId].style.backgroundColor = nodeMap[nodeId].style.backgroundColor;
      nodeMap[childId].style.border = nodeMap[nodeId].style.border;

      if (nodeMap[childId].data.inputs > 1 || nodeMap[childId].data.outputs >1) return;

      forwardNodes(childId);
    };
    
    nodesList.forEach(node => {
      const element = router.getElement(node.id);
      const hasCountHandler = element.handlers.find(handler => handler.name.toLowerCase() === "count");
      if (!hasCountHandler) return;
      
      const inputs = node.data.inputs;
      const outputs = node.data.outputs;
      
      if (inputs === 1 && outputs === 1) {
        backwardNodes(node.id);
        forwardNodes(node.id);
      }
    });
    
    return Object.values(nodeMap);
  };
  
  const propagateColorsBackwardAndForward = (nodesList, edgesList, router) => {
    const backwardNodes = propagateBackward(nodesList, edgesList);
    const forwardNodes = propagateForward(backwardNodes, edgesList);
    const finalNodes = propagateMix(forwardNodes, edgesList, router);
    return finalNodes;
  };
  

  const applyColorsToGraph = useCallback(
    async (nodesList, edgesList, routerInstance) => {
      const nodesWithCount = nodesList.filter((node) => {
        const element = routerInstance.getElement(node.id);
        return element && element.handlers && element.handlers.some((h) => h.name.toLowerCase() === 'count');
      });
      if (nodesWithCount.length === 0) {
        return { updatedNodes: nodesList, updatedEdges: edgesList };
      }
      try {
        const results = await Promise.all(
          nodesWithCount.map((node) =>
            lastValueFrom(webSocketService.getHandlers(node.id, 'count'))
          )
        );
        const updatedNodes = nodesList.map((node) => {
          const element = routerInstance.getElement(node.id);
          if (
            element &&
            element.handlers &&
            element.handlers.some((h) => h.name.toLowerCase() === 'count')
          ) {
            const idx = nodesWithCount.findIndex((n) => n.id === node.id);
            if (idx !== -1) {

              const newCount = Number(results[idx]);
              const prevCount = lastReadingCountRef.current[node.id] || 0;
              const countDiff = newCount - prevCount;
              const countPerSecond = countDiff / (interv); // normalise per second
              lastReadingCountRef.current[node.id] = newCount; 

              const { background, border } = getNodeColorByCount(countPerSecond, 2, 6);

              return {
                ...node,
                style: {
                  ...node.style,
                  backgroundColor: background,
                  border: `1px solid ${border}`,
                },
              };
            }
          }
          return node;
        });
        const updatedEdges = edgesList.map((edge) => {
          const targetNode = updatedNodes.find((node) => node.id === edge.target);
          if (targetNode && targetNode.style && targetNode.style.border) {
            return {
              ...edge,
              style: {
                ...edge.style,
                stroke: targetNode.style.border.replace('1px solid ', ''),
                strokeWidth: 2,
              },
            };
          }
          return edge;
        });
        return { updatedNodes: updatedNodes, updatedEdges: updatedEdges };
      } catch (err) {
        return { updatedNodes: nodesList, updatedEdges: edgesList };
      }
    },
    [webSocketService]
  );

  const updateColors = useCallback(() => {
    if (!router || nodesRef.current.length === 0) return;
    applyColorsToGraph(nodesRef.current, edgesRef.current, router)
      .then(({ updatedNodes, updatedEdges }) => {
        const finalNodes = propagateColorsBackwardAndForward(updatedNodes, updatedEdges, router);
        const newUpdateEdges = updatedEdges.map((edge) => {
          const targetNode = finalNodes.find((node) => node.id === edge.target);
          if (targetNode && targetNode.style && targetNode.style.border) {
            return {
              ...edge,
              style: {
                ...edge.style,
                stroke: targetNode.style.border.replace('1px solid ', ''),
                strokeWidth: 2,
              },
            };
          }
          return edge;
        });
        setNodes(finalNodes);
        setEdges(newUpdateEdges);
      })
      .catch((err) => console.error(err));
  }, [router, applyColorsToGraph]);

  const fetchData = async () => {
    setLoading(true);
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

            setColorsApplied(false);

            applyColorsToGraph(layoutedNodes, edgesWithProposal, routerTreeModel)
            .then(({ updatedNodes, updatedEdges }) => {
              setNodes(updatedNodes);
              setEdges(updatedEdges);
              setColorsApplied(true);
            })
            .catch((err) => console.error(err));

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
    if (colorsApplied) {
      setTimeout(() => {
        updateColors();
        setColorsApplied(false);
        setLoading(false);
      }, 50);
    }
  }, [colorsApplied]);
  
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

  useEffect(() => {
    if (!router) return;
    const intervalId = setInterval(() => {
      updateColors();
    }, interv * 1000);
    return () => clearInterval(intervalId);
  }, [router, updateColors]);

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
    setTimeout(() => {
      handleReorganizeNodes();
    }, 50);
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
    const layout = await getLayoutedElements(resetNodes, edgesRef.current);
    setNodes(layout.nodes);
    setEdges(layout.edges);
  };

  const handleTargetNode = useCallback((nodeId) => {
    const node = nodesRef.current.find(n => n.id === nodeId);
    if (node && node.position && node.style) {
      const nodeWidth = parseFloat(node.style.width) || 0;
      const nodeHeight = parseFloat(node.style.height) || 0;
      const centerX = node.position.x + nodeWidth / 2;
      const centerY = node.position.y + nodeHeight / 2;
      setCenter(centerX, centerY, { duration: 500 });
    }
  }, [setCenter]);
  
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
          {loading && (
            <Box
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              zIndex="100"
            >
              <VStack color="teal">
                  <Spinner color="blue.500" />
                  <Text color="blue.500">Loading...</Text>
              </VStack>
            </Box>
          )}
          {!loading && (<ReactFlow
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
          </ReactFlow>)}
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

      <AddElementModal
        isOpen={isAddElementModalOpen}
        onCancel={handleAddElementCancel}
        onConfirm={handleAddElementConfirm}
        newElementName={newElementName}
        setNewElementName={setNewElementName}
        classesData={classesData}
      />
    </>
  );
};

export default LayoutFlow;
