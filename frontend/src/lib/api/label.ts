import type { Label, NewLabelPayload } from '../../types/todo';

export const getLabelItems = async () => {
  const res = await fetch('http://localhost:3000/labels');
  if (!res.ok) {
    throw new Error('Failed to fetch label items');
  }
  const json: Label[] = await res.json();
  return json;
};

export const addLabelItem = async (payload: NewLabelPayload) => {
  const res = await fetch('http://localhost:3000/labels', {
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
  const res = await fetch(`http://localhost:3000/labels/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error('Failed to delete label item');
  }
};
