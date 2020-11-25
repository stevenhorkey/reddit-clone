import React from 'react'
import { Box, Flex, Link, Button } from '@chakra-ui/react';
import NextLink from 'next/link';
import { useMeQuery, useLogoutMutation } from '../generated/graphql';

interface NavbarProps {

}

const Navbar: React.FC<NavbarProps> = ({}) => {
    const [{data, fetching}] = useMeQuery();
    const [{fetching: logoutFetching},logout] = useLogoutMutation();
    let body = null;

    if(fetching) {
        // loading
        
    } else if (!data?.me) {
        // logged in
        body = (
            <>
                <NextLink href="/login">
                    <Link mr={2}>Login</Link>
                </NextLink>
                <NextLink href="/register">
                    <Link>Register</Link>
                </NextLink>
            </>
        );
    } else {
        // not logged in
        body = (
            <>
                <Box d='inline' mr={2}>{data.me.username}</Box>
                <Button variant="link" isLoading={logoutFetching} onClick={() => logout()}>Logout</Button>
            </>
        );
    }

    return (
        <Flex p={4} bg="tomato">
            <Box ml="auto">
                {body}
            </Box>
        </Flex>
    );
}

export default Navbar;