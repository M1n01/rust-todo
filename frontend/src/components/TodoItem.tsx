import { FC, ChangeEventHandler, useState, useEffect } from 'react';
import { Card, Checkbox, Button, Group, Modal, TextInput, Box, Badge, Stack, Grid, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconTrash, IconEdit } from '@tabler/icons-react';
import type { Label, Todo, UpdateTodoPayload } from '../types/todo';
import { toggleLabels } from '../lib/toggleLabels';

type Props = {
  todo: Todo;
  onUpdate: (todo: UpdateTodoPayload) => void;
  onDelete: (id: number) => void;
  labels: Label[];
};

const TodoItem: FC<Props> = ({ todo, onUpdate, onDelete, labels }) => {
  const [opened, { open, close }] = useDisclosure(false);
  const [editText, setEditText] = useState(todo.text);
  const [editLabels, setEditLabels] = useState<Label[]>([]);

  // propsのtodo変更時に再度初期化
  useEffect(() => {
    setEditText(todo.text);
    setEditLabels(todo.labels);
  }, [todo, labels]);

  const handleCompletedCheckbox: ChangeEventHandler = () => {
    onUpdate({
      ...todo,
      completed: !todo.completed,
      labels: todo.labels.map((label) => label.id),
    });
  };

  const handleCloseModal = () => {
    onUpdate({
      id: todo.id,
      text: editText,
      completed: todo.completed,
      labels: editLabels.map((label) => label.id),
    });
    close();
  };

  const handleDelete = () => onDelete(todo.id);

  return (
    <Card key={todo.id}>
      <Grid gutter="xs">
        <Grid.Col span={1}>
          <Checkbox
            checked={todo.completed}
            onChange={handleCompletedCheckbox}
            variant="outline"
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Stack>
            <Text>{todo.text}</Text>
            <Group>
              {todo.labels.map((label) => (
                <Badge key={label.id} variant="light" style={{ textTransform: 'none' }}>{label.name}</Badge>
              ))}
            </Group>
          </Stack>
        </Grid.Col>
        <Grid.Col span={5}>
          <Group justify="flex-end">
            <Button onClick={open} leftSection={<IconEdit />} variant="light">
              Edit
            </Button>
            <Button onClick={handleDelete} color="red" leftSection={<IconTrash />} variant="light">
              Delete
            </Button>
          </Group>
        </Grid.Col>
      </Grid>
      <Modal
        opened={opened}
        onClose={handleCloseModal}
        title="Edit Todo"
      >
        <Box>
          <Stack>
            <TextInput
              value={editText}
              label="Todo text"
              onChange={(e) => setEditText(e.target.value)}
            />
            <Stack>
              <Text size="md">Labels</Text>
              {labels.map((label) => (
                <Checkbox
                  key={label.id}
                  label={label.name}
                  checked={editLabels.some((editLabel) => editLabel.id === label.id)}
                  onChange={() => setEditLabels((prev) => toggleLabels(prev, label))}
                />
              ))}
            </Stack>
          </Stack>
        </Box>
      </Modal>
    </Card>
  );
};

export default TodoItem;
