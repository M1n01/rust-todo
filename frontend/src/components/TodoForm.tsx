import { FC, useState } from 'react';
import { Label, NewTodoPayload } from '../types/todo';
import { TextInput, Button, Paper, Grid, Box, Modal, Stack, Checkbox, Badge, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconPlus, IconLabel } from '@tabler/icons-react';
import { toggleLabels } from '../lib/toggleLabels';

// point1
type Props = {
  onSubmit: (newTodo: NewTodoPayload) => void;
  labels: Label[];
};

const TodoForm: FC<Props> = ({ onSubmit, labels }) => {
  // point2
  const [editText, setEditText] = useState('');
  const [editLabels, setEditLabels] = useState<Label[]>([]);
  const [opened, { open, close }] = useDisclosure(false);

  // point3
  const addTodoHandler = async () => {
    if (!editText) return;

    onSubmit({
      text: editText,
      labels: editLabels.map((label) => label.id),
    });
    setEditText('');
    close();
  };

  // point4
  return (
    <Paper withBorder radius="md" p="md">
      <Box>
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              label="new todo text"
              placeholder="Enter todo text"
              variant="filled"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Group>
              {editLabels.map((label) => (
                <Badge key={label.id} variant="light" style={{ textTransform: 'none' }}>{label.name}</Badge>
              ))}
            </Group>
          </Grid.Col>
          <Grid.Col span={6} style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button onClick={open} leftSection={<IconLabel />} variant="light" color="gray">
              Select label
            </Button>
          </Grid.Col>
          <Grid.Col span={6} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={addTodoHandler} leftSection={<IconPlus />} variant="light">
              Add todo
            </Button>
          </Grid.Col>
        </Grid>
      </Box>
      <Modal opened={opened} onClose={close} title="Select label">
        <Stack>
          {labels && labels.map((label) => (
            <Checkbox
              key={label.id}
              checked={editLabels.find(({ id }) => id === label.id) ? true : false}
              onChange={() => setEditLabels((prev) => toggleLabels(prev, label))}
              label={label.name}
            />
          ))}
        </Stack>
      </Modal>
    </Paper>
  );
};

export default TodoForm;
