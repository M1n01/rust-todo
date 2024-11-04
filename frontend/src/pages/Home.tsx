import { FC, useState } from 'react';
import { Box, Stack } from '@mantine/core';
import { NewTodoPayload, Todo } from '../types/todo';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
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

  const onUpdate = (updatedTodo: Todo) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === updatedTodo.id) {
          return {
            ...todo,
            ...updatedTodo, // 必要な部分だけoverride
          };
        }
        return todo;
      })
    );
  };

  // point2
  return (
    <Layout>
      <Box>
        <Stack>
          <TodoForm onSubmit={onSubmit} />
          <TodoList todos={todos} onUpdate={onUpdate} />
        </Stack>
      </Box>
    </Layout>
  );
};

export default Home;
