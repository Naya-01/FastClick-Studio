import React, { createContext, useContext, useState, useCallback } from 'react';
import { WebsocketService } from '../services/webSocketService';

const ClassesContext = createContext();

export const ClassesProvider = ({ children }) => {
  const [classesData, setClassesData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const websocketService = new WebsocketService();

  const refetchClasses = useCallback(() => {
    setLoading(true);
    setError(null);
    const subscription = websocketService.getAllHandlersFields('classes').subscribe({
      next: (data) => {
        const classesArray = data.split("\n").map(line => line.trim()).filter(line => line !== '');
        setClassesData(classesArray);
        setLoading(false);
      },
      error: (err) => {
        console.error("Error when fetching classes:", err);
        setError(err);
        setLoading(false);
      },
    });
    return () => subscription.unsubscribe();
  }, [websocketService]);

  return (
    <ClassesContext.Provider value={{ classesData, loading, error, refetchClasses }}>
      {children}
    </ClassesContext.Provider>
  );
};

export const useClasses = () => useContext(ClassesContext);
