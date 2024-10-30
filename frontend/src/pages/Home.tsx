import { FC } from 'react';
import { Button, Card, Group, TextInput } from '@mantine/core';

import Layout from '../components/Layout';

const Home: FC = () => {

  return (
    <Layout>
      <Card withBorder radius="md" p="md">
        <TextInput placeholder="タスクを入力してください" label="タスク" />
        <Group justify="flex-end">
          <Button radius="md" mt="md">
            追加
          </Button>
        </Group>
      </Card>
    </Layout>
  );
};

export default Home;
