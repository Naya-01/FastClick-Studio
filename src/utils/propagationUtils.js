import { getNodeColorByCount } from './colors';

export const propagateBackward = (nodesList, edgesList, packetCounts, colorParams, router) => {
  const nodeMap = {};
  const childrenByNode = {};
  const visitCount = {};

  nodesList.forEach(node => {
    const initialCount = packetCounts[node.id] || 0;

    nodeMap[node.id] = {
      ...node,
      data: {
        ...node.data,
        packetCount: initialCount,
      },
      style: { ...node.style },
    };

    if (router.getElement(node.id)) {
      const { background, border } = getNodeColorByCount(initialCount, colorParams.medium, colorParams.high);
      nodeMap[node.id].style.backgroundColor = background;
      nodeMap[node.id].style.border = `1px solid ${border}`;
    }

    childrenByNode[node.id] = [];
    visitCount[node.id] = 0;
  });

  const parentsByChild = {};
  const childCountPerParent = {};

  edgesList.forEach(edge => {
    if (!childrenByNode[edge.source]) childrenByNode[edge.source] = [];
    childrenByNode[edge.source].push(edge.target);

    if (!parentsByChild[edge.target]) parentsByChild[edge.target] = [];
    parentsByChild[edge.target].push(edge.source);

    childCountPerParent[edge.source] = (childCountPerParent[edge.source] || 0) + 1;
  });

  const terminals = nodesList.filter(node => !childrenByNode[node.id] || childrenByNode[node.id].length === 0);
  const queue = [...terminals.map(n => n.id)];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const currentCount = nodeMap[currentId].data.packetCount || 0;

    const parents = parentsByChild[currentId] || [];
    parents.forEach(parentId => {
      const parentPacketCount = nodeMap[parentId].data.packetCount || 0;
      const totalChildren = childCountPerParent[parentId] || 0;
      const parentDrops = nodeMap[parentId].data?.drops || 0;

      if (totalChildren > 1) {
        nodeMap[parentId].data.packetCount = parentPacketCount + currentCount;
        visitCount[parentId] += 1;

        if (visitCount[parentId] === totalChildren) {
          if (router.getElement(parentId)) {
            const { background, border } = getNodeColorByCount(nodeMap[parentId].data.packetCount, colorParams.medium, colorParams.high);
            nodeMap[parentId].style.backgroundColor = background;
            nodeMap[parentId].style.border = `1px solid ${border}`;
          }
          queue.push(parentId);
        }
      } else if (totalChildren === 1) {
        if (parentPacketCount === 0) {
          nodeMap[parentId].data.packetCount = currentCount + parentDrops;
        }
        if (router.getElement(parentId)) {

          const effectiveCount = nodeMap[parentId].data.packetCount || 0;
          const { background, border } = getNodeColorByCount(effectiveCount, colorParams.medium, colorParams.high);
          nodeMap[parentId].style.backgroundColor = background;
          nodeMap[parentId].style.border = `1px solid ${border}`;
        }
        queue.push(parentId);
      }
    });
  }

  return Object.values(nodeMap);
};


export const propagateForward = (nodesList, edgesList, packetCounts, colorParams, router) => {
  const nodeMap = {};
  nodesList.forEach(node => {
    const initialCount = packetCounts[node.id] || 0;

    nodeMap[node.id] = {
      ...node,
      data: {
        ...node.data,
        packetCount: initialCount,
      },
      style: { ...node.style },
    };
  });

  const sourceNodes = nodesList.filter(node => !edgesList.some(edge => edge.target === node.id));

  sourceNodes.forEach(source => {
    let current = source;

    while (true) {
      const childEdge = edgesList.find(edge => edge.source === current.id);
      if (!childEdge) break;

      const child = nodeMap[childEdge.target];
      if (!child) break;

      if ((current.data.outputs || 0) > 1 || (current.data.inputs || 0) > 1) break;
      const childPacketCount = child.data.packetCount || 0;
      const currentPacketCount = nodeMap[current.id].data.packetCount || 0;
      const childDrops = child.data?.drops || 0;

      const parentCount = edgesList.filter(edge => edge.target === child.id).length;
      if (childPacketCount === 0 || parentCount > 1) {
        child.data.packetCount = currentPacketCount - childDrops;

        if (router.getElement(child.id)) {
          const { background, border } = getNodeColorByCount(child.data.packetCount, colorParams.medium, colorParams.high);
          child.style.backgroundColor = background;
          child.style.border = `1px solid ${border}`;
        }
      }

      current = child;
    }
  });

  return Object.values(nodeMap);
};

  export const propagateColorsBackwardAndForward = (nodesList, edgesList, router, packetCounts, colorParams) => {
    const backwardNodes = propagateBackward(nodesList, edgesList, packetCounts, colorParams, router);
    const forwardNodes = propagateForward(backwardNodes, edgesList, packetCounts, colorParams, router);
    return forwardNodes;
  };