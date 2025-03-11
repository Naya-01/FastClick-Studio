import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import LayoutFlow from './pages/LayoutFlow';
import { ReactFlowProvider } from '@xyflow/react';
import { AlertProvider } from './context/AlertContext';
import { ChakraProvider } from '@chakra-ui/react';
import { ClassesProvider } from './context/ClassesContext';

function App() {
  return (
    <ChakraProvider> 
      <Router>
        <AlertProvider>
          <ClassesProvider>
            <div className="App">
              <ReactFlowProvider>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/config" element={<LayoutFlow />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </ReactFlowProvider>
            </div>
          </ClassesProvider>
        </AlertProvider>
      </Router>
    </ChakraProvider>
  );
}

export default App;