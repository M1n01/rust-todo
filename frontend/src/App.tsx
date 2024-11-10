import { FC } from 'react';
import { MantineProvider } from '@mantine/core';
// import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Todo from './pages/Todo';

const App: FC = () => {
  return (
    <MantineProvider defaultColorScheme="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Todo />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
};

export default App;
