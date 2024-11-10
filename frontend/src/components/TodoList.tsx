import { FC } from 'react';
import type { Label, Todo, UpdateTodoPayload } from '../types/todo';
import { Stack, Title} from '@mantine/core';
import TodoItem from './TodoItem';

// point1
type Props = {
  todos: Todo[];
  labels: Label[];
  onUpdate: (todo: UpdateTodoPayload) => void;
  onDelete: (id: number) => void;
};

const TodoList: FC<Props> = ({ todos, labels, onUpdate, onDelete }) => {

  return (
    <Stack>
      <Title order={3} style={{ textAlign: 'left' }}>Todo List</Title>
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onUpdate={onUpdate}
          onDelete={onDelete}
          labels={labels}
        />
      ))}
    </Stack>
  );
};

export default TodoList;
