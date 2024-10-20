// import React, { useState, useEffect } from 'react';
// import './App.css';
// import LayoutFlow from './components/LayoutFlow';
// import { ReactFlowProvider } from '@xyflow/react'; 

// function App() {
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     const checkConnection = async () => {
//       try {
//         const response = await fetch('/clickConfig');
//         if (!response.ok) {
//           throw new Error('Failed to connect');
//         }
//         setIsConnected(true);
//       } catch (error) {
//         console.error('Connection error:', error);
//         setIsConnected(false);
//       }
//     };
    
//     checkConnection();
//   }, []);

//   return (
//     <div className="App">
//       {isConnected ? (
//         <ReactFlowProvider>
//           <LayoutFlow />
//         </ReactFlowProvider>
//       ) : (
//         <div className="not-connected">
//           <h1>Not Connected</h1>
//           <p>We could not establish a connection to the Click server.</p>
//         </div>
//       )}
//     </div>
//   );
// }

// export default App;


import './App.css';
import LayoutFlow from './components/LayoutFlow';
import { ReactFlowProvider } from '@xyflow/react'; // Ajout du provider

function App() {
  return (
    <div className="App">
      <ReactFlowProvider> {/* Encapsuler le composant dans ReactFlowProvider */}
        <LayoutFlow />
      </ReactFlowProvider>
    </div>
  );
}

export default App;
