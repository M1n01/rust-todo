import { FC, useEffect, useState } from 'react';
import { Box, Stack, Button, Modal, TextInput, Text, AppShell, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconLabel, IconEdit } from '@tabler/icons-react';

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
      <div className={classes.navbarMain}>{links}</div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
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
          <Stack>
            <TextInput
              placeholder="New label"
              value={editName}
              onChange={(event) => setEditName(event.currentTarget.value)}
            />
            <Box>
              <Button onClick={onSubmit}>Submit</Button>
            </Box>
          </Stack>
          <Stack>
            {labels.map((label) => (
              <Stack key={label.id}>
                <Group>
                  <Text>{label.name}</Text>
                  <Button onClick={() => onDeleteLabel(label.id)}>Delete</Button>
                </Group>
              </Stack>
            ))}
          </Stack>
        </Box>
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
