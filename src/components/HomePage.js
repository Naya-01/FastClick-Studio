import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Button, 
  Box, 
  Flex, 
  Heading, 
  VStack, 
} from '@chakra-ui/react';
import { useAlert } from '../context/AlertContext';


function HomePage() {
  const navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleVisualizeClick = () => {
    navigate('/config');
  };

  return (
    <>
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
              FastClick Visualizer
              <Box as="span" color="brand.500">.</Box>
            </Heading>
            
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
            <Box p="5">
    </Box>
          </VStack>
        </Flex>
      </Box>
    </>
  );
}

export default HomePage;