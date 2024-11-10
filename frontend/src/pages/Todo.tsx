import { FC, useEffect, useState } from 'react';
import { Box, Stack, Button, Modal, TextInput, Text, AppShell, Group, ActionIcon, Title, Grid } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLabel, IconEdit, IconTrash, IconPlus } from '@tabler/icons-react';

import { Label, NewLabelPayload, Todo, NewTodoPayload } from '../types/todo';
import { addTodoItem, getTodoItems, updateTodoItem, deleteTodoItem } from '../lib/api/todo';
import { getLabelItems, addLabelItem, deleteLabelItem } from '../lib/api/label';
import TodoForm from '../components/TodoForm';
import TodoList from '../components/TodoList';
import Layout from '../components/Layout';
import classes from '../components/Navbar.module.css';

type Props = {
  labels: Label[];
  filterLabelId: number | null;
  onSelectLabel: (label: Label | null) => void;
  onSubmitNewLabel: (newLabel: NewLabelPayload) => void;
  onDeleteLabel: (id: number) => void;
}

const Navbar: FC<Props> = ({
  labels,
  filterLabelId,
  onSelectLabel,
  onSubmitNewLabel,
  onDeleteLabel,
}) => {
  const [editName, setEditName] = useState('');
  const [openLabelModal, { open, close }] = useDisclosure(false);

  const onSubmit = () => {
    setEditName('');
    onSubmitNewLabel({ name: editName });
  };

  const links = labels.map((label) => (
    <a
      className={classes.link}
      data-active={label.id === filterLabelId || undefined}
      key={label.id}
      onClick={() => {
        onSelectLabel(label.id === filterLabelId ? null : label);
      }}
    >
      <IconLabel className={classes.linkIcon} stroke={1.5} />
      <span>{label.name}</span>
    </a>
  ));

  return (
    <AppShell.Navbar p="md">
      <Title order={4}>Labels</Title>
      <div className={classes.navbarMain}>{links}</div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => { event.preventDefault(); open() }}>
          <IconEdit className={classes.linkIcon} stroke={1.5} />
          <span>Edit</span>
        </a>
      </div>
      <Modal
        opened={openLabelModal}
        onClose={close}
        title="Create new label"
      >
        <Box>
          <Grid>
            <Grid.Col span={12}>
              <TextInput
                placeholder="New label"
                value={editName}
                onChange={(event) => setEditName(event.currentTarget.value)}
              />
            </Grid.Col>
            <Grid.Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={onSubmit} leftSection={<IconPlus />} variant="light">Submit</Button>
            </Grid.Col>
          </Grid>
        </Box>
        <Stack>
          {labels.map((label) => (
            <Stack key={label.id}>
              <Group>
                <ActionIcon onClick={() => onDeleteLabel(label.id)} color="red" variant="outline">
                  <IconTrash />
                </ActionIcon>
                <Text>{label.name}</Text>
              </Group>
            </Stack>
          ))}
        </Stack>
      </Modal>
    </AppShell.Navbar>
  );
};

const TodoPage: FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [filterLabelId, setFilterLabelId] = useState<number | null>(null);

  // point1
  const onSubmit = async (payload: NewTodoPayload) => {
    if (!payload.text) return;

    await addTodoItem(payload);
    // APIより再度Todo配列を取得
    const newTodos = await getTodoItems();
    setTodos(newTodos);
  };

  const onUpdate = async (updatedTodo: Todo) => {
    await updateTodoItem(updatedTodo);
    // APIより再度Todo配列を取得
    const todos = await getTodoItems();
    setTodos(todos);
  };

  const onDelete = async (id: number) => {
    await deleteTodoItem(id);
    const todos = await getTodoItems();
    setTodos(todos);
  };

  const onSelectLabel = (label: Label | null) => {
    setFilterLabelId(label?.id ?? null);
  };

  const onSubmitNewLabel = async (payload: NewLabelPayload) => {
    if (!labels.some((label) => label.name === payload.name)) {
      const res = await addLabelItem(payload);
      setLabels([...labels, res]);
    }
  };

  const onDeleteLabel = async (id: number) => {
    await deleteLabelItem(id);
    setLabels((prev) => prev.filter((label) => label.id !== id));
  };

  const dispTodos = filterLabelId
    ? todos.filter((todo) =>
      todo.labels.some((label) => label.id === filterLabelId)
    )
    : todos;

  useEffect(() => {
    ;(async () => {
      const newTodos = await getTodoItems();
      setTodos(newTodos);
      const labelResponse = await getLabelItems();
      setLabels(labelResponse);
    })();
  }, []);

  // point2
  return (
    <Layout navbar={<Navbar
      labels={labels}
      filterLabelId={filterLabelId}
      onSelectLabel={onSelectLabel}
      onSubmitNewLabel={onSubmitNewLabel}
      onDeleteLabel={onDeleteLabel}
    />} >
      <Box>
        <Stack>
          <TodoForm onSubmit={onSubmit} />
          <TodoList todos={dispTodos} onUpdate={onUpdate} onDelete={onDelete} />
        </Stack>
      </Box>
    </Layout>
  );
};

export default TodoPage;
