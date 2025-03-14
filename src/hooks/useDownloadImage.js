import { useCallback } from 'react';
import { toPng, toSvg } from 'html-to-image';
import { useReactFlow, getNodesBounds, getViewportForBounds } from '@xyflow/react';

export function useDownloadImage(reactFlowWrapper) {
  const { getNodes } = useReactFlow();
  
  return useCallback((format = 'png') => {
    if (!reactFlowWrapper.current) return;
    
    const { width: dynamicWidth, height: dynamicHeight } = reactFlowWrapper.current.getBoundingClientRect();
    
    const options = {
      backgroundColor: '#ffffff',
      width: dynamicWidth,
      height: dynamicHeight,
      style: {
        width: dynamicWidth,
        height: dynamicHeight,
      },
    };

    const downloadFn = format === 'svg' ? toSvg : toPng;
    const extension = format === 'svg' ? 'svg' : 'png';
    
    downloadFn(reactFlowWrapper.current, options)
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `graph.${extension}`;
        link.href = dataUrl;
        link.click();
      })
      .catch((error) => {
        console.error("Could not download image", error);
      });
  }, [reactFlowWrapper, getNodes]);
}
