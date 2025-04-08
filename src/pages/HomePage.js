import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Box, 
  Flex, 
  Heading, 
  VStack,
  FormControl,
  FormLabel,
  Input,
  Text,
  Link
} from '@chakra-ui/react';
import { useAlert } from '../context/AlertContext';


function HomePage() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [apiUrl, setApiUrl] = useState('');

  useEffect(() => {
    const storedUrl = localStorage.getItem('apiUrl');
    if (storedUrl) {
      setApiUrl(storedUrl);
    }
  }, []);

  const isValidUrl = (url) => {
    const pattern = /^(https?:\/\/)([a-zA-Z0-9\-\.]+)(:\d+)?(\/.*)?$/
    return pattern.test(url);
  };

  const handleVisualizeClick = () => {
    if (!apiUrl || !isValidUrl(apiUrl)) {
      showAlert('Error', 'Please enter a valid API URL', 'error');
      return;
    }
    localStorage.setItem('apiUrl', apiUrl);
    navigate('/config');
  };


  return (
    <Box
      position="relative"
      width="100vw"
      height="100vh"
      overflow="hidden"
      bg="brand.100"
    >
      <Flex
        position="relative"
        zIndex="1"
        w="100%"
        h="100%"
        align="center"
        justify="center"
        flexDir="column"
      >
        <VStack spacing={8} textAlign="center" maxW="2xl" px={4}>
          <Heading
            fontSize="5xl"
            color="brand.900"
            textShadow="2px 2px 4px rgba(0,0,0,0.1)"
            fontFamily="heading"
          >
            FastClick Studio
            <Box as="span" color="brand.500">.</Box>
          </Heading>
          <FormControl isRequired>
            <FormLabel>API URL</FormLabel>
            <Input
              placeholder="example : http://localhost:8080"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
          </FormControl>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={handleVisualizeClick}
            px={10}
            py={6}
            fontSize="xl"
            borderRadius="xl"
            boxShadow="xl"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: '2xl',
            }}
            transition="all 0.3s ease"
          >
            Visualize FastClick configuration
          </Button>
          <Link 
            href='https://github.com/Naya-01/FastClick-Studio'
            style={
              {
                textDecoration: 'underline',
                color: 'brand.500',
                fontSize: 'lg',
                fontWeight: 'bold',
              }
            }
          >
            Official documentation
          </Link>
        </VStack>
      </Flex>
    </Box>
  );
}

export default HomePage;