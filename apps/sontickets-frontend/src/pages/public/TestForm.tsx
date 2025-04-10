import { Box, Button, Text, VStack } from '@chakra-ui/react';
import { Helmet } from 'react-helmet-async';

const TestForm = () => {
  const handleConversionClick = () => {
    // Access the global gtag_report_conversion function
    if (typeof window !== 'undefined' && window.gtag_report_conversion) {
      window.gtag_report_conversion();
    } else {
      console.error('gtag_report_conversion function not available');
    }
  };

  return (
    <>
      <Helmet>
        {/* Google tag (gtag.js) */}
        <script async src='https://www.googletagmanager.com/gtag/js?id=AW-437148397'></script>
        <script>
          {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'AW-437148397');
          `}
        </script>

        {/* Event snippet for reservation conversion */}
        <script>
          {`
          function gtag_report_conversion(url) {
            var callback = function () {
              if (typeof(url) != 'undefined') {
                window.location = url;
              }
            };
            gtag('event', 'conversion', {
              'send_to': 'AW-437148397/cP08COGm-LYaEO21udAB',
              'event_callback': callback
            });
            return false;
          }
          window.gtag_report_conversion = gtag_report_conversion;
          `}
        </script>
      </Helmet>
      <Box
        width='100%'
        display='flex'
        flexDirection={'column'}
        alignItems='center'
        justifyContent='center'
      >
        <Box h={'100vh'}></Box>

        <VStack
          spacing={8}
          py={10}
          px={4}
          maxW='600px'
          mx='auto'
          borderWidth={1}
          borderRadius='lg'
          borderColor='gray.200'
          boxShadow='md'
        >
          <Text fontSize='2xl' fontWeight='bold'>
            Conversion Testing
          </Text>
          <Text>Click the button below to trigger conversion tracking</Text>
          <Button colorScheme='blue' size='lg' onClick={handleConversionClick}>
            Track Conversion
          </Button>
        </VStack>

        <Box height={'500vh'}>dsa</Box>
        <Box h={'20vh'}></Box>
      </Box>
    </>
  );
};

export default TestForm;
