// src/pages/Shuttle.tsx
import { FC, useEffect, useState } from 'react';
import { Container, Text, Button, Stack, Loader } from '@mantine/core';

const Shuttle: FC = () => {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFromShuttle = async () => {
    setLoading(true);
    setError(null);
    const SHUTTLE_URL = import.meta.env.VITE_SHUTTLE_URL as string;
    try {
      const response = await fetch(`${SHUTTLE_URL}/shuttle`);
      if (!response.ok) throw new Error('Request failed');
      const data = await response.json();
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFromShuttle();
  }, []);

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <Text size="xl">
          Shuttle Test
        </Text>
        
        {loading && <Loader />}
        
        {error && (
          <Text color="red" size="sm">
            Error: {error}
          </Text>
        )}
        
        {message && (
          <Text size="lg">
            {message}
          </Text>
        )}
        
        <Button onClick={fetchFromShuttle} loading={loading}>
          Refresh
        </Button>
      </Stack>
    </Container>
  );
};

export default Shuttle;
