export const propagateBackward = (nodesList, edgesList) => {
    const outCount = {};
    edgesList.forEach(edge => {
      outCount[edge.source] = (outCount[edge.source] || 0) + 1;
    });

    const nodeMap = {};
    nodesList.forEach(node => {
      nodeMap[node.id] = { ...node, style: { ...node.style } };
    });

    const terminalNodes = nodesList.filter(node => !edgesList.some(edge => edge.source === node.id));
    terminalNodes.forEach(terminal => {
      let current = terminal;
      while (true) {

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

  export const propagateForward = (nodesList, edgesList) => {
    const nodeMap = {};
    nodesList.forEach(node => {
      nodeMap[node.id] = { ...node, style: { ...node.style } };
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

        child.style.backgroundColor = current.style.backgroundColor;
        child.style.border = current.style.border;
        current = child;
      }
    });
    return Object.values(nodeMap);
  };

  export const propagateMix = (nodesList, edgesList, router) => {
    const nodeMap = {};
    nodesList.forEach(node => {
      nodeMap[node.id] = { 
        ...node, 
        data: { ...node.data },
        style: { ...node.style }
      };
    });
    
    
    const backwardNodes = (nodeId) => {
      const parentEdge = edgesList.find(edge => edge.target === nodeId);

      if (!parentEdge) return;

      const parentId = parentEdge.source;

      if (nodeMap[parentId].data.outputs > 1) return;

      nodeMap[parentId].style.backgroundColor = nodeMap[nodeId].style.backgroundColor;
      nodeMap[parentId].style.border = nodeMap[nodeId].style.border;
      backwardNodes(parentId);
    };
    
    const forwardNodes = (nodeId) => {
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

  export const propagateColorsBackwardAndForward = (nodesList, edgesList, router) => {
    const backwardNodes = propagateBackward(nodesList, edgesList);
    const forwardNodes = propagateForward(backwardNodes, edgesList);
    const finalNodes = propagateMix(forwardNodes, edgesList, router);
    return finalNodes;
  };