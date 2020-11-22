import React from 'react';
import {Box} from '@chakra-ui/react';

interface WrapperProps {
    variant? : 'small' | 'regular'
}

const Wrapper: React.FC<WrapperProps> = ({children, variant='regular'}) => {
    return (
        <Box maxW={variant === 'regular' ? 800 : 400} mx='auto' mt={8} w='100%' px={15}>
            {children}
        </Box>
    );
}

export default Wrapper;