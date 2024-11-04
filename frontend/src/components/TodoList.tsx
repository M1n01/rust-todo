import { FC } from 'react';
import type { Todo } from '../types/todo';
import { Card, Checkbox, Stack, Group, Title, Text } from '@mantine/core';

// point1
type Props = {
  todos: Todo[];
  onUpdate: (todo: Todo) => void;
};

const TodoList: FC<Props> = ({ todos, onUpdate }) => {
  // point2
  const handleCompletedCheckbox = (todo: Todo) => {
    onUpdate({
      ...todo,
      completed: !todo.completed,
    });
  };

  // point3
  return (
    <Stack>
      <Title order={3} style={{ textAlign: 'left' }}>Todo List</Title>
      {todos.map((todo) => (
        <Card key={todo.id}>
            <Checkbox
              checked={todo.completed}
              onChange={() => handleCompletedCheckbox(todo)}
              variant="outline"
              label={todo.text}
            />
        </Card>
      ))}
    </Stack>
  );
};

export default TodoList;
