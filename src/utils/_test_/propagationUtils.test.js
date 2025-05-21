import { propagateBackward, propagateForward, propagateColorsBackwardAndForward } from '../propagationUtils';
import { HandlerMode } from '../../models/enums';

describe('Propagation Utils', () => {
  const createMockRouter = (nodesWithHandler) => ({
    getElement: (id) => nodesWithHandler.includes(id) ? { handlers: [{ name: 'count' }] } : null
  });

  describe('propagateBackward', () => {
    it('should propagate from terminal nodes with handler to their parents', () => {
      const nodes = [
        { id: 'N0', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N1', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N2', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N3', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N4', data: { outputs: 1, inputs: 1 }, style: {} },
      ];

      const edges = [
        { source: 'N0', target: 'N1' },
        { source: 'N1', target: 'N2' },
        { source: 'N2', target: 'N3' },
        { source: 'N3', target: 'N4' },
      ];

      const packetCounts = {
        'N4': 48,
        'N3': 0,
        'N2': 0,
        'N1': 0,
        'N0': 0,
      };

      const router = createMockRouter(['N4']);
      const result = propagateBackward(nodes, edges, packetCounts, { medium: 20, high: 40 }, router, HandlerMode.COUNT);

      expect(result.find(n => n.id === 'N4').data.distance).toBe(0);
      expect(result.find(n => n.id === 'N3').data.distance).toBe(1);
      expect(result.find(n => n.id === 'N2').data.distance).toBe(2);
      expect(result.find(n => n.id === 'N1').data.distance).toBe(3);
      expect(result.find(n => n.id === 'N0').data.distance).toBe(4);

      expect(result.find(n => n.id === 'N4').data.packetCount).toBe(48);
      expect(result.find(n => n.id === 'N3').data.packetCount).toBe(48);
      expect(result.find(n => n.id === 'N2').data.packetCount).toBe(48);
      expect(result.find(n => n.id === 'N1').data.packetCount).toBe(48);
      expect(result.find(n => n.id === 'N0').data.packetCount).toBe(48);
    });

    it('should handle multiple children and aggregate values correctly', () => {
      const nodes = [
        { id: 'N3', data: { outputs: 2, inputs: 1 }, style: {} },
        { id: 'N4', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N5', data: { outputs: 1, inputs: 1 }, style: {} },
      ];

      const edges = [
        { source: 'N3', target: 'N4' },
        { source: 'N3', target: 'N5' },
      ];

      const packetCounts = {
        'N3': 0,
        'N4': 30,
        'N5': 20,
      };

      const router = createMockRouter(['N4', 'N5']);
      const result = propagateBackward(nodes, edges, packetCounts, { medium: 20, high: 40 }, router, HandlerMode.COUNT);

      console.log(result);


      expect(result.find(n => n.id === 'N3').data.packetCount).toBe(50);
      expect(result.find(n => n.id === 'N3').data.distance).toBe(1);
    });

    it('should handle drops in count mode', () => {
      const nodes = [
        { id: 'N1', data: { outputs: 1, inputs: 1, drops: 5 }, style: {} },
        { id: 'N2', data: { outputs: 1, inputs: 1 }, style: {} },
      ];

      const edges = [
        { source: 'N1', target: 'N2' },
      ];

      const packetCounts = {
        'N1': 0,
        'N2': 20,
      };

      const router = createMockRouter(['N2']);
      const result = propagateBackward(nodes, edges, packetCounts, { medium: 10, high: 20 }, router, HandlerMode.COUNT);

      expect(result.find(n => n.id === 'N1').data.packetCount).toBe(25);
    });

    it('should prioritize nodes with handlers as new reference points', () => {
      const nodes = [
        { id: 'N1', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N2', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N3', data: { outputs: 1, inputs: 1 }, style: {} },
      ];

      const edges = [
        { source: 'N1', target: 'N2' },
        { source: 'N2', target: 'N3' },
      ];

      const packetCounts = {
        'N1': 0,
        'N2': 30,
        'N3': 0,
      };

      const router = createMockRouter(['N2']);
      const result = propagateBackward(nodes, edges, packetCounts, { medium: 20, high: 40 }, router, HandlerMode.COUNT);

      expect(result.find(n => n.id === 'N2').data.packetCount).toBe(30);
      expect(result.find(n => n.id === 'N2').data.distance).toBe(0);
    });
  });

  describe('propagateForward', () => {
    it('should propagate from source nodes with handler to their children', () => {
      const nodes = [
        { id: 'N1', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N2', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N3', data: { outputs: 1, inputs: 1 }, style: {} },
      ];

      const edges = [
        { source: 'N1', target: 'N2' },
        { source: 'N2', target: 'N3' },
      ];

      const packetCounts = {
        'N1': 50,
        'N2': 0,
        'N3': 0,
      };

      const router = createMockRouter(['N1']);
      const colorParams = { medium: 20, high: 40 };

      const backwardResult = propagateBackward(nodes, edges, packetCounts, colorParams, router, HandlerMode.COUNT);
      const result = propagateForward(backwardResult, edges, packetCounts, colorParams, router, HandlerMode.COUNT);

      expect(result.find(n => n.id === 'N1').data.distance).toBe(0);
      expect(result.find(n => n.id === 'N2').data.distance).toBe(1);
      expect(result.find(n => n.id === 'N3').data.distance).toBe(2);

      expect(result.find(n => n.id === 'N1').data.packetCount).toBe(50);
      expect(result.find(n => n.id === 'N2').data.packetCount).toBe(50);
      expect(result.find(n => n.id === 'N3').data.packetCount).toBe(50);
    });

    it('should stop propagation at nodes with multiple outputs', () => {
      const nodes = [
        { id: 'N1', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N2', data: { outputs: 2, inputs: 1 }, style: {} },
        { id: 'N3', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N4', data: { outputs: 1, inputs: 1 }, style: {} },
      ];

      const edges = [
        { source: 'N1', target: 'N2' },
        { source: 'N2', target: 'N3' },
        { source: 'N2', target: 'N4' },
      ];

      const packetCounts = {
        'N1': 40,
        'N2': 0,
        'N3': 0,
        'N4': 0,
      };

      const router = createMockRouter(['N1']);
      const colorParams = { medium: 20, high: 40 };

      const backwardResult = propagateBackward(nodes, edges, packetCounts, colorParams, router, HandlerMode.COUNT);
      const result = propagateForward(backwardResult, edges, packetCounts, colorParams, router, HandlerMode.COUNT);


      expect(result.find(n => n.id === 'N2').data.packetCount).toBe(40);
      expect(result.find(n => n.id === 'N3').data.packetCount).toBe(0);
      expect(result.find(n => n.id === 'N4').data.packetCount).toBe(0);
    });

    it('should subtract drops when propagating forward in count mode', () => {
      const nodes = [
        { id: 'N1', data: { outputs: 1, inputs: 1, drops: 10 }, style: {} },
        { id: 'N2', data: { outputs: 1, inputs: 1 }, style: {} },
      ];

      const edges = [
        { source: 'N1', target: 'N2' },
      ];

      const packetCounts = {
        'N1': 50,
        'N2': 0,
      };

      const router = createMockRouter(['N1']);
      const colorParams = { medium: 20, high: 40 };

      const backwardResult = propagateBackward(nodes, edges, packetCounts, colorParams, router, HandlerMode.COUNT);
      const result = propagateForward(backwardResult, edges, packetCounts, colorParams, router, HandlerMode.COUNT);

      expect(result.find(n => n.id === 'N2').data.packetCount).toBe(40);
    });
  });

  describe('propagateColorsBackwardAndForward', () => {
    it('should combine both propagations correctly', () => {
      const nodes = [
        { id: 'N1', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N2', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N3', data: { outputs: 1, inputs: 1 }, style: {} },
      ];

      const edges = [
        { source: 'N1', target: 'N2' },
        { source: 'N2', target: 'N3' },
      ];

      const packetCounts = {
        'N1': 50,
        'N2': 0,
        'N3': 30,
      };

      const router = createMockRouter(['N1', 'N3']);
      const result = propagateColorsBackwardAndForward(
        nodes,
        edges,
        router,
        packetCounts,
        { medium: 20, high: 40 },
        HandlerMode.COUNT
      );

      expect(result.find(n => n.id === 'N1').data.packetCount).toBe(50);
      expect(result.find(n => n.id === 'N2').data.packetCount).toBe(30);
      expect(result.find(n => n.id === 'N3').data.packetCount).toBe(30);
    });

    it('should combine both propagations correctly with longer graph', () => {
        const nodes = [
          { id: 'N1', data: { outputs: 1, inputs: 1 }, style: {} },
          { id: 'N2', data: { outputs: 1, inputs: 1 }, style: {} },
          { id: 'N3', data: { outputs: 1, inputs: 1 }, style: {} },
          { id: 'N4', data: { outputs: 1, inputs: 1 }, style: {} },
          { id: 'N5', data: { outputs: 1, inputs: 1 }, style: {} },
        ];
  
        const edges = [
          { source: 'N1', target: 'N2' },
          { source: 'N2', target: 'N3' },
          { source: 'N3', target: 'N4' },
          { source: 'N4', target: 'N5' },
        ];
  
        const packetCounts = {
          'N1': 50,
          'N2': 0,
          'N3': 0,
          'N4': 0,
          'N5': 30,
        };
  
        const router = createMockRouter(['N1', 'N5']);
        const result = propagateColorsBackwardAndForward(
          nodes,
          edges,
          router,
          packetCounts,
          { medium: 20, high: 40 },
          HandlerMode.COUNT
        );
  
        expect(result.find(n => n.id === 'N1').data.packetCount).toBe(50);
        expect(result.find(n => n.id === 'N2').data.packetCount).toBe(50);
        expect(result.find(n => n.id === 'N3').data.packetCount).toBe(30);
        expect(result.find(n => n.id === 'N4').data.packetCount).toBe(30);
        expect(result.find(n => n.id === 'N5').data.packetCount).toBe(30);
    });

    it('should handle a long graph with multiple outputs correctly', () => {
      const nodes = [
        { id: 'N1', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N2', data: { outputs: 2, inputs: 1 }, style: {} },
        { id: 'N3', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N4', data: { outputs: 1, inputs: 1 }, style: {} },
        { id: 'N5', data: { outputs: 1, inputs: 1 }, style: {} },
      ];

      const edges = [
        { source: 'N1', target: 'N2' },
        { source: 'N2', target: 'N3' },
        { source: 'N2', target: 'N4' },
        { source: 'N3', target: 'N5' },
      ];

      const packetCounts = {
        'N1': 50,
        'N2': 0,
        'N3': 0,
        'N4': 0,
        'N5': 30,
      };

      const router = createMockRouter(['N1', 'N5', 'N4']);
      const result = propagateColorsBackwardAndForward(
        nodes,
        edges,
        router,
        packetCounts,
        { medium: 20, high: 40 },
        HandlerMode.COUNT
      );

      expect(result.find(n => n.id === 'N1').data.packetCount).toBe(50);
      expect(result.find(n => n.id === 'N2').data.packetCount).toBe(50);
      expect(result.find(n => n.id === 'N3').data.packetCount).toBe(30);
      expect(result.find(n => n.id === 'N4').data.packetCount).toBe(0);
      expect(result.find(n => n.id === 'N5').data.packetCount).toBe(30);
    });
  });
});