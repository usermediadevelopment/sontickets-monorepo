import { FormControl, FormErrorMessage, FormLabel, Input, InputProps } from '@chakra-ui/react';
import React from 'react';

interface ITextProps extends InputProps {
  label: string;
  name?: string;
  isRequired?: boolean;
  error?: string;
}

const TextInput = React.forwardRef<HTMLInputElement, ITextProps>(
  ({ label, error, ...otherProps }: ITextProps, ref) => {
    return (
      <FormControl>
        <FormLabel htmlFor='name'>{label}*</FormLabel>
        <Input ref={ref} {...otherProps} />
        <FormErrorMessage>{error}</FormErrorMessage>
      </FormControl>
    );
  }
);

export default TextInput;
