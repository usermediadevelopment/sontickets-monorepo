import { Box } from '@chakra-ui/react';

const TestForm = () => {
  return (
    <Box
      width='100%'
      display='flex'
      flexDirection={'column'}
      alignItems='center'
      justifyContent='center'
    >
      <Box h={'100vh'}></Box>
      <iframe
        title='reservas'
        src='http://localhost:5173/form/noi-remb?lang=es&from=mejoresrestaurantes.co&gclid=321321321312'
        height='800px'
        width='100%'
      ></iframe>
      <Box height={'500vh'}>dsa</Box>
      <Box h={'20vh'}></Box>
    </Box>
  );
};

export default TestForm;
