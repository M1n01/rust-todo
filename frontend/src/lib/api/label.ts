import type { Label, NewLabelPayload } from '../../types/todo';

export const getLabelItems = async () => {
  const rust_url = process.env.VITE_SHUTTLE_URL ?? 'http://localhost:8000';
  const res = await fetch(`${rust_url}/labels`);
  if (!res.ok) {
    throw new Error('Failed to fetch label items');
  }
  const json: Label[] = await res.json();
  return json;
};

export const addLabelItem = async (payload: NewLabelPayload) => {
  const rust_url = process.env.VITE_SHUTTLE_URL ?? 'http://localhost:8000';
  const res = await fetch(`${rust_url}/labels`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to add label item');
  }
  const json: Label = await res.json();
  return json;
};

export const deleteLabelItem = async (id: number) => {
  const rust_url = process.env.VITE_SHUTTLE_URL ?? 'http://localhost:8000';
  const res = await fetch(`${rust_url}/labels/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete label item');
  }
};
