import React from 'react'
import { Formik, Form, Field } from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage, Button } from '@chakra-ui/react';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import {useRegisterMutation} from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';



interface registerProps {

}

const Register: React.FC<registerProps> = ({ }) => {
    const router = useRouter();
    const [,register] = useRegisterMutation();
    return (
        <Wrapper variant='small'>
            <Formik
                initialValues={{ username: "", password: "" }}
                onSubmit={async (values, {setErrors}) => {
                    const response = await register(values);
                    console.log(response);
                    if(response.data?.register.errors) {
                        setErrors(toErrorMap(response.data.register.errors))
                    } else if (response.data?.register.user) {
                        router.push('/');
                    }
                    response.data?.register?.user?.id;
                }}
            >
                {(props) => (
                    <Form>
                        <InputField name="username" placeholder="username" label="Username" />
                        <InputField name="password" placeholder="password" label="Password" type="password" />
                        <Button mt={4} isLoading={props.isSubmitting} type="submit">Register</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

export default Register;