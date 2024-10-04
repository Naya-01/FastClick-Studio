import React, { useState, useEffect, useCallback } from 'react';
import {ReactFlow, addEdge, ConnectionLineType, useNodesState, useEdgesState } from '@xyflow/react';
import dagre from '@dagrejs/dagre'; // Importer dagre pour le layout
import { WebsocketService } from '../services/webSocketService';
import { RouterTreeModel } from '../models/router-tree-model';
import '@xyflow/react/dist/style.css';
import { Pair } from '../models/pair';

// Fonction pour configurer dagre et calculer la disposition des nœuds
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 172;
const nodeHeight = 36;

const lespairs = [
  new Pair('FromDevice@1', 'Print@2'),
  new Pair('FromDevice@1', 'Host@6'),
  new Pair('FromDevice@1', 'Discard@4'),
  new Pair('Print@2', 'ToIPSummaryDump@3'),
  new Pair('ToIPSummaryDump@3', 'ToIPSummaryDumpLongLabel@3'),
  new Pair('ToIPSummaryDumpLongLabel@3', 'Discard@4')
];

// Fonction pour appliquer le layout dagre aux nœuds et arêtes
const getLayoutedElements = (nodes, edges, direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  // Ajouter chaque nœud au graphe dagre
  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  // Ajouter chaque arête au graphe dagre
  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  // Appliquer le layout dagre
  dagre.layout(dagreGraph);

  // Mettre à jour les positions des nœuds selon le calcul de dagre
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
  const websocketService = new WebsocketService();

  useEffect(() => {
    const subscription = websocketService.getFlatConfig().subscribe((configData) => {
      const routerTreeModel = new RouterTreeModel(configData);
      const parsedNodes = [];
      const nodeSet = new Set();
      // const pairs = lespairs;
      const pairs = routerTreeModel.getAllPairs();

      pairs.forEach((pair) => {
        if (!nodeSet.has(pair.source)) {
          parsedNodes.push({
            id: pair.source,
            data: { label: pair.source },
            position: { x: 0, y: 0 }, // temporaire dagre s'en occupe
            type: 'default',
            draggable: true,
            style: { border: '1px solid #004085', padding: 10, borderRadius: 5, backgroundColor: '#cce5ff' },
          });
          nodeSet.add(pair.source);
        }
        if (!nodeSet.has(pair.destination)) {
          parsedNodes.push({
            id: pair.destination,
            data: { label: pair.destination },
            position: { x: 0, y: 0 },
            type: 'default',
            draggable: true,
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

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange} // Gérer les changements des nœuds
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LayoutFlow;
