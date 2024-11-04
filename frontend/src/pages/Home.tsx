import { FC, useEffect, useState } from 'react';
import { Box, Stack } from '@mantine/core';
import { NewTodoPayload, Todo } from '../types/todo';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
import Layout from '../components/Layout';
import { addTodoItem, getTodoItems } from '../lib/api/todo';

const Home: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);

  // point1
  const onSubmit = async (payload: NewTodoPayload) => {
    if (!payload.text) return;

    await addTodoItem(payload);
    // APIより再度Todo配列を取得
    const newTodos = await getTodoItems();
    setTodos(newTodos);
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

  useEffect(() => {
    ;(async () => {
      const newTodos = await getTodoItems();
      setTodos(newTodos);
    })();
  }, []);

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
