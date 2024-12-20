import { FC } from 'react';
import { MantineProvider } from '@mantine/core';
// import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Todo from './pages/Todo';
import Hello from './pages/Hello';
import Shuttle from './pages/Shuttle';

const App: FC = () => {
  return (
    <MantineProvider defaultColorScheme="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Todo />} />
          <Route path="/hello" element={<Hello />} />
          <Route path="/shuttle" element={<Shuttle />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
};

export default App;
