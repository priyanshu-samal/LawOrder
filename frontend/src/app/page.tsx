"use client";

import { useUser } from '@auth0/nextjs-auth0';
import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react';
import Link from 'next/link';

export default function Home() {
  const { user, error, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  return (
    <Container centerContent maxW="container.md" height="100vh" display="flex" flexDirection="column" justifyContent="center" alignItems="center">
      <VStack spacing={4}>
        <Heading>LawOrder - N-Device Login</Heading>
        <Text>Welcome to the N-device login functionality demo.</Text>
        {user ? (
          <VStack spacing={4}>
            <Text>Welcome {user.name}! You are logged in.</Text>
            <Link href="/dashboard" passHref>
              <Button as="a" colorScheme="teal">Go to Dashboard</Button>
            </Link>
            <Link href="/api/auth/logout" passHref>
              <Button as="a" colorScheme="red">Logout</Button>
            </Link>
          </VStack>
        ) : (
          <Link href="/api/auth/login" passHref>
            <Button as="a" colorScheme="teal">Login</Button>
          </Link>
        )}
      </VStack>
    </Container>
  );
}
