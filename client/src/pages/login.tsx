import React from 'react'
import { Formik, Form } from 'formik';
import Wrapper from '../components/Wrapper';
import InputField from '../components/InputField';
import {useLoginMutation} from '../generated/graphql';
import { toErrorMap } from '../utils/toErrorMap';
import { useRouter } from 'next/router';
import { Button } from '@chakra-ui/react';



interface loginProps {

}

const Login: React.FC<loginProps> = ({ }) => {
    const router = useRouter();
    const [,login] = useLoginMutation();
    return (
        <Wrapper variant='small'>
            <h1>Login</h1>
            <Formik
                initialValues={{ username: "", password: "" }}
                onSubmit={async (values, {setErrors}) => {
                    const response = await login(values);
                    console.log(response);
                    if(response.data?.login.errors) {
                        setErrors(toErrorMap(response.data.login.errors))
                    } else if (response.data?.login.user) {
                        router.push('/');
                    }
                    response.data?.login?.user?.id;
                }}
            >
                {(props) => (
                    <Form>
                        <InputField name="username" placeholder="username" label="Username" />
                        <InputField name="password" placeholder="password" label="Password" type="password" />
                        <Button mt={4} isLoading={props.isSubmitting} type="submit">Login</Button>
                    </Form>
                )}
            </Formik>
        </Wrapper>
    );
}

export default Login;