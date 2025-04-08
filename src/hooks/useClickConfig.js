import { useCallback } from 'react';
import { WebsocketService } from '../services/webSocketService';
import { ConfigStatus } from '../models/status';

export const useClickConfig = (nodes, edges, router, setConnectionError, setConfigStatus) => {
  const webSocketService = new WebsocketService();

  const generateClickConfig = useCallback(() => {
    const nodesConfig = nodes
      .map((node) => {
        return `${node.id} :: ${node.data.type}(${node.data.configuration || ''});`;
      })
      .join('\n');

    const edgeMap = new Map();
    edges.forEach((edge) => {
      if (!edgeMap.has(edge.source)) {
        edgeMap.set(edge.source, []);
      }
      edgeMap.get(edge.source).push(edge);
    });

    const edgesConfig = Array.from(edgeMap.entries())
      .map(([source, edgesArray]) => {
        const sortedEdges = edgesArray.sort((a, b) => {
          const portA = parseInt(a.sourceHandle.split('-')[2], 10) || 0;
          const portB = parseInt(b.sourceHandle.split('-')[2], 10) || 0;
          return portA - portB;
        });
        if (sortedEdges.length > 1) {
          return sortedEdges
            .map((edge, index) => `${source}[${index}] -> ${edge.target};`)
            .join('\n');
        } else {
          return `${source} -> ${sortedEdges[0].target};`;
        }
      })
      .join('\n');

    const config = `${nodesConfig}\n${edgesConfig}`;

    webSocketService.updateClickConfig(config).subscribe({
      next: (resp) => {
        if (resp === 'error') {
          setConfigStatus(ConfigStatus.ERROR);
        } else {
          setConfigStatus(ConfigStatus.SUCCESS);
        }        
      },
      error: (err) => {
        console.error("Failed to update configuration:", err);
        setConnectionError(true);
      },
      complete: () => console.log("Configuration update complete.")
    });
  }, [nodes, edges, router, webSocketService]);

  return { generateClickConfig };
};
