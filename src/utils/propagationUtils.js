import { HandlerMode } from '../models/enums';
import { getNodeColorByCount } from './colors';

export const propagateBackward = (nodesList, edgesList, packetCounts, colorParams, router, mode) => {
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
        distance: router.getElement(node.id).handlers.find(handler => handler.name.toLowerCase() === mode) ? 0 : Infinity,
      },
      style: { ...node.style },
    };

    if (mode === HandlerMode.CYCLE) {
      if (initialCount === 0) {
        nodeMap[node.id].data.distance = Infinity;
      }
    }

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
    const currentDistance = nodeMap[currentId].data.distance;

    const parents = parentsByChild[currentId] || [];
    parents.forEach(parentId => {
      const parentPacketCount = nodeMap[parentId].data.packetCount || 0;
      const totalChildren = childCountPerParent[parentId] || 0;
      const parentDrops = nodeMap[parentId].data?.drops || 0;

      if (totalChildren > 1) {
        nodeMap[parentId].data.packetCount = parentPacketCount + currentCount;
        visitCount[parentId] += 1;

        if (visitCount[parentId] === totalChildren) {
          const childDistances = (childrenByNode[parentId] || []).map(childId => nodeMap[childId].data.distance);
          const avgDistance = childDistances.reduce((a, b) => a + b, 0) / childDistances.length;
          nodeMap[parentId].data.distance = avgDistance + 1;
          if (router.getElement(parentId)) {
            const { background, border } = getNodeColorByCount(nodeMap[parentId].data.packetCount, colorParams.medium, colorParams.high);
            nodeMap[parentId].style.backgroundColor = background;
            nodeMap[parentId].style.border = `1px solid ${border}`;
          }
          queue.push(parentId);
        }
      } else if (totalChildren === 1) {
        const newDistance = currentDistance + 1;
        if (newDistance < nodeMap[parentId].data.distance) {
          nodeMap[parentId].data.distance = newDistance;

          if (parentPacketCount === 0) {
            if(mode === HandlerMode.COUNT) {
              nodeMap[parentId].data.packetCount = currentCount + parentDrops;
            } else {
              nodeMap[parentId].data.packetCount = currentCount;
            }
          }
          if (router.getElement(parentId)) {

            const effectiveCount = nodeMap[parentId].data.packetCount || 0;
            const { background, border } = getNodeColorByCount(effectiveCount, colorParams.medium, colorParams.high);
            nodeMap[parentId].style.backgroundColor = background;
            nodeMap[parentId].style.border = `1px solid ${border}`;
          }
        }
        queue.push(parentId);
      }
    });
  }

  return Object.values(nodeMap);
};


export const propagateForward = (nodesList, edgesList, packetCounts, colorParams, router, mode) => {
  const nodeMap = {};
  nodesList.forEach(node => {
    const initialCount = packetCounts[node.id] || 0;

    nodeMap[node.id] = {
      ...node,
      data: {
        ...node.data,
        //packetCount: initialCount,
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
      //const childDrops = child.data?.drops || 0;
      const parentDrops = nodeMap[current.id].data?.drops || 0;
      const newDistance = nodeMap[current.id].data.distance + 1;

      const parentCount = edgesList.filter(edge => edge.target === child.id).length;
      if ((childPacketCount === 0 || parentCount === 1) && newDistance < child.data.distance) {
        if(mode === HandlerMode.COUNT){
          child.data.packetCount = currentPacketCount - parentDrops;
        } else {
          child.data.packetCount = currentPacketCount;  
        }

        child.data.distance = newDistance;
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

  export const propagateColorsBackwardAndForward = (nodesList, edgesList, router, packetCounts, colorParams, mode) => {
    const backwardNodes = propagateBackward(nodesList, edgesList, packetCounts, colorParams, router, mode);
    const forwardNodes = propagateForward(backwardNodes, edgesList, packetCounts, colorParams, router, mode);
    return forwardNodes;
  };