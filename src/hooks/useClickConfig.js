import { useCallback } from 'react';
import { WebsocketService } from '../services/webSocketService';

export const useClickConfig = (nodes, edges, router) => {
  const webSocketService = new WebsocketService();

  const generateClickConfig = useCallback(() => {
    const nodesConfig = nodes
      .map(node => {
        return `${node.id} :: ${node.data.type}(${node.data.configuration || ''});`;
      })
      .join('\n');

    const edgeMap = new Map();
    edges.forEach(edge => {
      if (!edgeMap.has(edge.source)) {
        edgeMap.set(edge.source, []);
      }
      edgeMap.get(edge.source).push(edge);
    });

    const edgesConfig = Array.from(edgeMap.entries())
      .map(([source, edges]) => {
        if (edges.length > 1) {
          return edges
            .map((edge, index) => `${source}[${index}] -> ${edge.target};`)
            .join('\n');
        } else {
          return `${source} -> ${edges[0].target};`;
        }
      })
      .join('\n');
    
    const config = `${nodesConfig}\n${edgesConfig}`;

    webSocketService.updateClickConfig(config).subscribe({
      next: (resp) => console.log("Configuration updated successfully:", resp),
      error: (err) => console.error("Failed to update configuration:", err),
      complete: () => console.log("Configuration update complete.")
    });
  }, [nodes, edges, router, webSocketService]);

  return { generateClickConfig };
};
