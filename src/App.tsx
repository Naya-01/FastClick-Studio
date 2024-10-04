import React from 'react';
import './App.css';
import GraphVisualizer from './components/GraphVisualizer';
import { ReactFlowProvider } from '@xyflow/react'; // Ajout du provider

function App() {
  return (
    <div className="App">
      <ReactFlowProvider> {/* Encapsuler le composant dans ReactFlowProvider */}
        <GraphVisualizer />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
