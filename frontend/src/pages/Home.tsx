import { FC, useState } from 'react';
import { Box } from '@mantine/core';
import { NewTodoPayload, Todo } from '../types/todo';
import TodoForm from '../components/TodoForm';

import Layout from '../components/Layout';

const Home: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const createdId = () => todos.length + 1;

  // point1
  const onSubmit = async (payload: NewTodoPayload) => {
    if (!payload.text) return;
    setTodos((prev) =>[
      {
        id: createdId(),
        text: payload.text,
        completed: false,
      },
      ...prev,
    ]);
  };

  // point2
  return (
    <Layout>
      <Box>
        <TodoForm onSubmit={onSubmit} />
      </Box>
    </Layout>
  );
};

export default Home;
