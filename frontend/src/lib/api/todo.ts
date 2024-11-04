import type { NewTodoPayload, Todo } from '../../types/todo';

export const addTodoItem = async (payload: NewTodoPayload) => {
  const res = await fetch('http://localhost:3000/todos', {
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
  const res = await fetch('http://localhost:3000/todos');
  if (!res.ok) {
    throw new Error('Failed to fetch todo items');
  }
  const json: Todo[] = await res.json();
  return json;
};

export const updateTodoItem = async (todo: Todo) => {
  const { id, ...updateTodo } = todo;
  const res = await fetch(`http://localhost:3000/todos/${id}`, {
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
