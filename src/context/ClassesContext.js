import React, { createContext, useContext, useEffect, useState } from 'react';
import { WebsocketService } from '../services/webSocketService';

const ClassesContext = createContext();

export const ClassesProvider = ({ children }) => {
  const [classesData, setClassesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const websocketService = new WebsocketService();
  

  useEffect(() => {
    if (!classesData) {
      const subscription = websocketService.getAllHandlersFields('classes').subscribe({
        next: (data) => {
            const classesArray = data.split("\n").map(line => line.trim()).filter(line => line !== '');
            setClassesData(classesArray);
            setLoading(false);
        },
        error: (err) => {
            console.error("Erreur lors du fetch des classes:", err);
            setLoading(false);
        },
      });
      return () => subscription.unsubscribe();
    }
  }, [classesData, websocketService]);

  return (
    <ClassesContext.Provider value={{ classesData, loading }}>
      {children}
    </ClassesContext.Provider>
  );
};

export const useClasses = () => useContext(ClassesContext);
