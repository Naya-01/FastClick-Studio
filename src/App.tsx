import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './components/HomePage';
import LayoutFlow from './components/LayoutFlow';
import { ReactFlowProvider } from '@xyflow/react';
import { AlertProvider } from './context/AlertContext';
import { ChakraProvider } from '@chakra-ui/react';

function App() {
  return (
    <ChakraProvider> 
      <Router>
        <AlertProvider>
          <div className="App">
            <ReactFlowProvider>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/config" element={<LayoutFlow />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </ReactFlowProvider>
          </div>
        </AlertProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;