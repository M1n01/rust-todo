import { FC, ChangeEventHandler, useState, useEffect } from 'react';
import { Card, Checkbox, Button, Group, Modal, TextInput, Stack, Box } from '@mantine/core';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import type { Todo } from '../types/todo';
import { modalInnerStyle } from '../styles/modal';

type Props = {
  todo: Todo;
  onUpdate: (todo: Todo) => void;
  onDelete: (id: number) => void;
};

const TodoItem: FC<Props> = ({ todo, onUpdate, onDelete }) => {
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState('');

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

  const onCloseEditModal = () => {
    onUpdate({
      ...todo,
      text: editText,
    });
    setEditing(false);
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
          <Button onClick={() => setEditing(true)} leftSection={<IconEdit />} variant="light">Edit</Button>
          <Button onClick={handleDelete} color="red" leftSection={<IconTrash />} variant="light">Delete</Button>
        </Group>
      </Group>
      <Modal
        opened={editing}
        onClose={onCloseEditModal}
        title="Edit Todo"
      >
        {/* <Box style={{
          ...modalInnerStyle,
          boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
        }}> */}
        <TextInput
          value={todo.text}
          label="Todo text"
          onChange={(e) => setEditText(e.target.value)}
        />
        {/* </Box> */}
      </Modal>
    </Card>
  );
};

export default TodoItem;
