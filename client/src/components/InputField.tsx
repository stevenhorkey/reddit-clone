import React, { InputHTMLAttributes } from 'react'
import { useField, Field } from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage, Button } from '@chakra-ui/react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
    label: string
    name: string
};

export const InputField: React.FC<InputFieldProps> = ({
    label, size, ...props
}) => {
    const [field, {error}] = useField(props);
    return (
        <Field name={field.name}>
            {({ field, form }) => (
              <FormControl isInvalid={!!error}>
                <FormLabel htmlFor={field.name}>{label}</FormLabel>
                <Input {...field} {...props} type={props.type ? props.type : 'text'} id={field.name} />
                {error ? <FormErrorMessage>{error}</FormErrorMessage> : null}
              </FormControl>
            )}
        </Field>
    );
}

export default InputField;