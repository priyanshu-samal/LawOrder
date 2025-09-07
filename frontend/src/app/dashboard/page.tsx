"use client";

import { useEffect, useState } from 'react';
import { useUser, withPageAuthRequired, getAccessToken } from '@auth0/nextjs-auth0/client';
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  List, 
  ListItem
} from '@chakra-ui/react';
import axios from '../../lib/axios';
import { getDeviceId } from '../../lib/utils';

function Dashboard() {
  const { user, error, isLoading } = useUser();
  const [devices, setDevices] = useState([]);
  const [forcedLogout, setForcedLogout] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [me, setMe] = useState(null);

  useEffect(() => {
    const loginAndFetchStatus = async () => {
      if (user) {
        try {
          const { accessToken } = await getAccessToken();
          const deviceId = getDeviceId();
          await axios.post('/login', 
            { device_id: deviceId, user_agent: navigator.userAgent },
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );

          const statusInterval = setInterval(async () => {
            try {
              const { data } = await axios.get('/status', {
                headers: { Authorization: `Bearer ${accessToken}`, 'X-Device-ID': deviceId },
              });
              if (!data.active) {
                setForcedLogout(true);
                clearInterval(statusInterval);
              }
            } catch (error) {
              console.error('Error checking status:', error);
            }
          }, 5000);

          // Fetch user info
          const { data: meData } = await axios.get('/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          setMe(meData);

        } catch (error) {
          if (error.response && error.response.status === 409) {
            const { accessToken } = await getAccessToken();
            const { data } = await axios.get('/devices', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            setDevices(data);
            onOpen();
          } else {
            console.error('Error during login:', error);
          }
        }
      }
    };

    loginAndFetchStatus();
  }, [user, onOpen]);

  const handleForceLogout = async (deviceId) => {
    try {
      const { accessToken } = await getAccessToken();
      await axios.post('/force-logout', { device_id: deviceId }, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      onClose();
      window.location.reload(); // Reload to try logging in again
    } catch (error) {
      console.error('Error forcing logout:', error);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>{error.message}</div>;

  if (forcedLogout) {
    return (
      <Container centerContent>
        <Heading>You have been logged out</Heading>
        <Text>This device was logged out because the account was used on another device.</Text>
        <Button onClick={() => window.location.href = '/api/auth/login'}>Login Again</Button>
      </Container>
    );
  }

  return (
    <Container>
      <VStack spacing={4}>
        <Heading>Dashboard</Heading>
        {me && (
          <Box>
            <Text>Full Name: {me.full_name}</Text>
            <Text>Phone Number: {me.phone_number}</Text>
          </Box>
        )}
        <Button onClick={() => window.location.href = '/api/auth/logout'}>Logout</Button>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Device Limit Reached</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>You have reached the maximum number of allowed devices. Please log out from one of the following devices to continue.</Text>
            <List spacing={3} mt={4}>
              {devices.map((device) => (
                <ListItem key={device.device_id}>
                  <Box display="flex" justifyContent="space-between">
                    <Text>{device.user_agent}</Text>
                    <Button colorScheme="red" size="sm" onClick={() => handleForceLogout(device.device_id)}>
                      Force Logout
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}

export default withPageAuthRequired(Dashboard);
