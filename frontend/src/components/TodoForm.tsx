import { FC, useState } from 'react';
import { NewTodoPayload } from '../types/todo';
import { TextInput, Button, Group, Paper, Grid, Box } from '@mantine/core';

// point1
type Props = {
  onSubmit: (newTodo: NewTodoPayload) => void;
};

const TodoForm: FC<Props> = ({ onSubmit }) => {
  // point2
  const [editText, setEditText] = useState('');

  // point3
  const addTodoHandler = async () => {
    if (!editText) return;

    onSubmit({ text: editText });
    setEditText('');
  };

  // point4
  return (
    <Paper withBorder radius="md" p="md">
      <Box>
        <Grid>
          <Grid.Col span={12}>
            <TextInput
              label="new todo text"
              variant="filled"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              style={{ width: '100%' }}
            />
          </Grid.Col>
          <Grid.Col span={12} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button onClick={addTodoHandler}>
              Add todo
            </Button>
          </Grid.Col>
        </Grid>
      </Box>
    </Paper>
  )
};

export default TodoForm;
