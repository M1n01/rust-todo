import { FC, ChangeEventHandler, useState, useEffect } from 'react';
import { Card, Checkbox, Button, Group, Modal, TextInput, Stack, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import type { Todo } from '../types/todo';

type Props = {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
  onDelete: (id: number) => void;
};

const TodoItem: FC<Props> = ({ todo, onUpdate, onDelete }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [editText, setEditText] = useState(todo.text);

  // propsのtodo変更時に再度初期化
  useEffect(() => {
    setEditText(todo.text);
  }, [todo]);

  const handleCompletedCheckbox: ChangeEventHandler = (e) => {
    onUpdate({
      ...todo,
      completed: !todo.completed,
    });
  };

  const handleCloseModal = () => {
    onUpdate({
      ...todo,
      text: editText,
    });
    close();
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
        <Group>
          <Button onClick={open} leftSection={<IconEdit />} variant="light">
            Edit
          </Button>
          <Button onClick={handleDelete} color="red" leftSection={<IconTrash />} variant="light">
            Delete
          </Button>
        </Group>
      </Group>
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title="Edit Todo"
      >
        <Box
          // style={{
          //   ...modalInnerStyle,
          // }}
        >
          <TextInput
            value={editText}
            label="Todo text"
            onChange={(e) => setEditText(e.target.value)}
          />
        </Box>
      </Modal>
    </Card>
  );
};

export default TodoItem;
