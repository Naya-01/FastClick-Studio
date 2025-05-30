import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

export const getLayoutedElements = (nodes, edges, direction = 'DOWN') => {

  const isHorizontal = direction === 'RIGHT' || direction === 'LEFT';

  const elkGraph = {
    id: 'root',
    layoutOptions: {
      'elk.algorithm': 'layered',
      'elk.direction': direction,
      'elk.layered.spacing.nodeNodeBetweenLayers': '100',
      'elk.spacing.nodeNode': '150',
      'elk.edgeRouting': 'POLYLINE',
      'elk.layered.nodePlacement.strategy': 'NETWORK_SIMPLEX',
      'elk.layered.mergeEdges': 'false',
      'org.eclipse.elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
    },
    children: nodes.map((node) => ({
      id: node.id,
      width: parseFloat(node.style?.width) || 172,
      height: 50,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target],
    })),
  };

  return elk.layout(elkGraph).then((layout) => {
    const layoutedNodes = nodes.map((node) => {
      const nodeLayout = layout.children.find((n) => n.id === node.id);
      if (nodeLayout) {
        node.position = {
          x: nodeLayout.x,
          y: nodeLayout.y,
        };

        node.targetPosition = isHorizontal ? 'left' : 'top';
        node.sourcePosition = isHorizontal ? 'right' : 'bottom';
      }
      node.draggable = true;
      return node;
    });

    return { nodes: layoutedNodes, edges };
  });
};
