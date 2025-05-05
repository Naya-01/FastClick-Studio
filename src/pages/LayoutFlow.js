import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Switch,
  FormControl,
} from '@chakra-ui/react';
import { handleData, calculateNodeWidth, getAdjustedCoordinates } from '../utils/graphUtils';
import NodeListSidebar from '../components/NodeListSidebar';
import NodeDetailsModal from '../components/NodeDetailsModal';
import DynamicHandlesNode from '../components/DynamicHandlesNode';
import { WebsocketService } from '../services/webSocketService';
import { RouterTreeModel } from '../models/router-tree-model';
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
import { propagateColorsBackwardAndForward } from '../utils/propagationUtils';
import { useDownloadImage } from '../hooks/useDownloadImage';
import Legend from '../components/Legend';
import { ConfigStatus, HandlerMode } from '../models/enums';
import RouterDetails from '../components/RouterDetails';

const edgeTypes = {
  proposalEdge: ProposalEdge,
};

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
  const lastReadingDropsRef = useRef({});
  const countPerSecondRef = useRef({});
  const [configStatus, setConfigStatus] = useState(ConfigStatus.IDLE);
  const [mode, setMode] = useState(HandlerMode.COUNT);
  const [colorParamsMap, setColorParamsMap] = useState({
    [HandlerMode.COUNT]: { medium: 5, high: 12 },
    [HandlerMode.CYCLE]: { medium: 350, high: 750 }
  });
  const [openRouterDetails, setOpenRouterDetails] = useState(false);
  const [isHotconfig, setIsHotconfig] = useState(true);



  const { classesData, refetchClasses } = useClasses();

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

  const { generateClickConfig } = useClickConfig(nodes, edges, router, setConnectionError, setConfigStatus);


  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);
  useEffect(() => {
    edgesRef.current = edges;
  }, [edges]);  

  const applyColorsToGraph = useCallback(
    async (nodesList, edgesList, routerInstance) => {
      const nodesWithCount = nodesList.filter((node) => {
        const element = routerInstance.getElement(node.id);
        return element && element.handlers && element.handlers.some((h) => h.name.toLowerCase() === mode);
      });

      const nodesWithDrops = nodesList.filter((node) => {
        const element = routerInstance.getElement(node.id);
        return element && element.handlers && element.handlers.some((h) => h.name.toLowerCase() === 'drops');
      });
      if (nodesWithCount.length === 0) {
        return { updatedNodes: nodesList, updatedEdges: edgesList };
      }
      try {
        const [countResults, dropsResults] = await Promise.all([
          Promise.all(
            nodesWithCount.map((node) =>
              lastValueFrom(webSocketService.getHandlers(node.id, mode))
            )
          ),
          Promise.all(
            nodesWithDrops.map((node) =>
              lastValueFrom(webSocketService.getHandlers(node.id, 'drops'))
            )
          )
        ]);

        if(mode === HandlerMode.CYCLE){
          for(let i = 0; i < countResults.length; i++){
            const response = countResults[i];
            if (!response || response.trim() === "") continue;
            const tokens = response.split(" ");
            if (tokens.length < 3) continue;
            const calls = Number(tokens[1]);
            const cycles = Number(tokens[2]);
            if (isNaN(calls) || isNaN(cycles) || calls === 0) continue;
            const cyclesPerTask = cycles / calls;
            countResults[i] = cyclesPerTask;
          }
        }

        const updatedNodes = nodesList.map((node) => {
          const element = routerInstance.getElement(node.id);
          let newCount = 0;
          let newDrops = 0;

          if (element && element.handlers) {
            if (element.handlers.some((h) => h.name.toLowerCase() === mode)) {
              const idx = nodesWithCount.findIndex((n) => n.id === node.id);
              if (idx !== -1) {
                newCount = Number(countResults[idx]) || 0;
              }
            }
            if (element.handlers.some((h) => h.name.toLowerCase() === 'drops')) {
              const idx = nodesWithDrops.findIndex((n) => n.id === node.id);
              if (idx !== -1) {
                newDrops = Number(dropsResults[idx]) || 0;
              }
            }
          }

          let countPerSecond = 0;
          let dropPerSecond = 0;

          if(mode === HandlerMode.CYCLE){
            countPerSecond = newCount;

          }else if(mode === HandlerMode.COUNT){
            const prevCount = lastReadingCountRef.current[node.id] || 0;
            const prevDrops = lastReadingDropsRef.current[node.id] || 0;
            const countDiff = newCount - prevCount;
            const dropsDiff = newDrops - prevDrops;
            countPerSecond = countDiff / interv; // On ne prend que le count
            dropPerSecond = dropsDiff / interv;
            lastReadingCountRef.current[node.id] = newCount;
            lastReadingDropsRef.current[node.id] = newDrops;
          }

          countPerSecondRef.current[node.id] = countPerSecond;
          const { background, border } = getNodeColorByCount(countPerSecond, colorParamsMap[mode].medium, colorParamsMap[mode].high);

          if (!router.getElement(node.id)) {
            background = getAddColor();
            border = getAddBorderColor();
          }

          return {
            ...node,
            data: {
              ...node.data,
              drops: dropPerSecond,
            },
            style: {
              ...node.style,
              backgroundColor: background,
              border: `1px solid ${border}`,
            },
          };
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
        const finalNodes = propagateColorsBackwardAndForward(updatedNodes, updatedEdges, router, countPerSecondRef.current, colorParamsMap[mode], mode);
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
          const hotconfigHandler = routerTreeModel.getElement("handlers").handlers.find(handler => handler.name.toLowerCase() === "hotconfig");
          setIsHotconfig(hotconfigHandler ? true : false);
  
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
    refetchClasses();
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
    if (configStatus === ConfigStatus.SUCCESS) {
      fetchData();
      setConfigStatus(ConfigStatus.IDLE);
      showAlert('Configuration Updated', 'The configuration has been updated successfully.', 'success');
    }else if(configStatus === ConfigStatus.ERROR){
      setConfigStatus(ConfigStatus.IDLE);
      showAlert('Configuration Error', 'There was an error updating the configuration.', 'error');
    }
  }, [configStatus]);

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

  const downloadFlatConfig = () => {
    webSocketService.getFlatConfig().subscribe({
      next: (flatConfig) => {
        const blob = new Blob([flatConfig], { type: 'text/plain;charset=utf-8' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'config.click';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      },
      error: (error) => {
        console.error("An error occurred while downloading the flat config :", error);
      }
    });
  };
  
  
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
            <Legend colorParams={colorParamsMap[mode]} setColorParams={setColorParamsMap} mode={mode}/>
            <Controls 
            showInteractive={false}
            />
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

        {!isHotconfig && (
          <Box
            position="absolute"
            top="20px"
            right="800px"
            p={3}
            bg="yellow.400"
            color="black"
            borderRadius="md"
            boxShadow="md"
          >
            <Text fontWeight="bold">Warning:</Text>
            <Text>The hotconfig is missing ! The '-R' option is essential to enable hotconfig</Text>
          </Box>
        )}

        <GraphControls 
          onDownloadImage={useDownloadImage(reactFlowWrapper)}
          onGenerateConfig={isHotconfig ? generateClickConfig : null}
          onReorganize={handleReorganizeNodes}
          onDownloadFlatConfig={downloadFlatConfig}
          openRouterDetails={() => setOpenRouterDetails(true)}
        />
        
        <Box
          position="absolute"
          top="13px"
          right="450px"
          zIndex="1000"
          bg="gray.100"
          px={4}
          py={2}
          borderRadius="xl"
          boxShadow="md"
        >
          <FormControl display="flex" alignItems="center" gap={4}>
            <Text fontWeight="medium">Cycles</Text>
            <Switch
              id="mode-switch"
              isChecked={mode === HandlerMode.COUNT}
              onChange={(e) =>
                setMode(e.target.checked ? HandlerMode.COUNT : HandlerMode.CYCLE)
              }
              colorScheme="blue"
            />
            <Text fontWeight="medium">Count</Text>
          </FormControl>
        </Box>
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

      <RouterDetails
        isOpen={openRouterDetails}
        onClose={() => setOpenRouterDetails(false)}
        router={router}
      />
    </>
  );
};

export default LayoutFlow;
