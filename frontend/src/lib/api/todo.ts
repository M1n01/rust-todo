import type { NewTodoPayload, Todo, UpdateTodoPayload } from '../../types/todo';

export const addTodoItem = async (payload: NewTodoPayload) => {
  const rust_url = process.env.SHUTTLE_URL ?? 'http://localhost:8000';
  const res = await fetch(`${rust_url}/todos`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to add todo item');
  }
  const json: Todo = await res.json();
  return json;
};

export const getTodoItems = async () => {
  const rust_url = process.env.SHUTTLE_URL ?? 'http://localhost:8000';
  const res = await fetch(`${rust_url}/todos`);
  if (!res.ok) {
    throw new Error('Failed to fetch todo items');
  }
  const json: Todo[] = await res.json();
  return json;
};

export const updateTodoItem = async (todo: UpdateTodoPayload) => {
  const rust_url = process.env.SHUTTLE_URL ?? 'http://localhost:8000';
  const { id, ...updateTodo } = todo;
  const res = await fetch(`${rust_url}/todos/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updateTodo),
  });
  if (!res.ok) {
    throw new Error('Failed to update todo item');
  }
  const json: Todo = await res.json();
  return json;
};

export const deleteTodoItem = async (id: number) => {
  const rust_url = process.env.SHUTTLE_URL ?? 'http://localhost:8000';
  const res = await fetch(`${rust_url}/todos/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete todo item');
  }
};
