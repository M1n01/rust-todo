// src/pages/Hello.tsx
import { FC, useEffect, useState } from 'react';
import { Container, Text, Button, Stack, Loader } from '@mantine/core';

const Hello: FC = () => {
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHello = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://worker.abe-minato-bz.workers.dev/hello');
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
    fetchHello();
  }, []);

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <Text size="xl">
          Worker Test
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
        
        <Button onClick={fetchHello} loading={loading}>
          Refresh
        </Button>
      </Stack>
    </Container>
  );
};

export default Hello;
