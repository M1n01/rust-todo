import { FC } from 'react';
import type { Todo } from '../types/todo';
import { Stack, Group, Title} from '@mantine/core';
import TodoItem from './TodoItem';

// point1
type Props = {
  todos: Todo[];
  onUpdate: (todo: Todo) => void;
  onDelete: (id: number) => void;
};

const TodoList: FC<Props> = ({ todos, onUpdate, onDelete }) => {

  return (
    <Stack>
      <Title order={3} style={{ textAlign: 'left' }}>Todo List</Title>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </Stack>
  );
};

export default TodoList;
