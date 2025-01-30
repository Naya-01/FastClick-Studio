import { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from '@chakra-ui/react';

const AlertContext = createContext();

export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState(null);
  const toast = useToast();

  const showAlert = (title, message, status = 'error') => {
    setAlert({ title, message, status });
  };

  useEffect(() => {
    if (alert) {
      toast({
        title: alert.title,
        description: alert.message,
        status: alert.status,
        duration: 3000,
        isClosable: true,
        position: 'top-right',
      });
      setAlert(null);
    }
  }, [alert, toast]);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  return useContext(AlertContext);
};
