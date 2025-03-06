import {
  VStack,
  Text,
  FormLabel,
  HStack,
  Switch,
  Textarea,
  FormControl,
  Input,
  Box,
} from '@chakra-ui/react';

type TextAreaWithUrlProps = {
  label: string;
  textArea: {
    es: {
      value: string;
      onChange: (e: any) => void;
    };
    en: {
      value: string;
      onChange: (e: any) => void;
    };
  };
  switch: {
    value: boolean;
    onChange: (e: any) => void;
  };
  inputUrl: {
    value: string;
    onChange: (e: any) => void;
  };
};

const TextAreaWithUrl = ({
  label,
  textArea: {
    es: { value: textAreaValue, onChange: textAreaOnChange },
    en: { value: textAreaValueEn, onChange: textAreaOnChangeEn },
  },
  switch: { value: switchValue, onChange: switchOnChange },
  inputUrl: { value: inputUrlValue, onChange: inputUrlOnChange },
}: TextAreaWithUrlProps) => {
  return (
    <VStack mt={8} gap={1}>
      <Box width={'100%'}>
        <FormLabel gap={4} display={'flex'} flexDirection={'row'}>
          <Text>{label}</Text>

          <HStack display={'flex'} justifyContent={'center'} alignItems={'center'}>
            <Text fontSize={'sm'} as={'b'}>
              Url
            </Text>
            <Switch isChecked={switchValue} id='email-alerts' onChange={switchOnChange} />
          </HStack>
        </FormLabel>

        <Box display={'flex'} flexDirection={'row'} gap={2} mb={4} w={'100%'}>
          <Box w={'100%'}>
            Español
            <Textarea
              value={textAreaValue}
              style={{
                width: '100%',
              }}
              size={'lg'}
              placeholder=''
              onChange={textAreaOnChange}
            />
          </Box>
          <Box w={'100%'}>
            English
            <Textarea
              value={textAreaValueEn}
              style={{
                width: '100%',
              }}
              size={'lg'}
              placeholder=''
              onChange={textAreaOnChangeEn}
            />
          </Box>
        </Box>
      </Box>
      {switchValue && (
        <FormControl>
          <FormLabel>Url</FormLabel>
          <Input value={inputUrlValue} type='text' onChange={inputUrlOnChange} />
        </FormControl>
      )}
    </VStack>
  );
};

export default TextAreaWithUrl;
