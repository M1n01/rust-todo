import { FC, ChangeEventHandler } from 'react';
import { Card, Checkbox, Button, Group } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import type { Todo } from '../types/todo';

type Props = {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
  onDelete: (id: number) => void;
};

const TodoItem: FC<Props> = ({ todo, onUpdate, onDelete }) => {
    const handleCompletedCheckbox: ChangeEventHandler = (e) => {
    onUpdate({
      ...todo,
      completed: !todo.completed,
    });
  };

  const handleDelete = () => onDelete(todo.id);

  return (
    <Card key={todo.id}>
      <Group justify="space-between">
        <Checkbox
          checked={todo.completed}
          onChange={handleCompletedCheckbox}
          variant="outline"
          label={todo.text}
        />
        <Button onClick={handleDelete} color="red" leftSection={<IconTrash />} variant="light">Delete</Button>
      </Group>
    </Card>
  );
};

export default TodoItem;
