import { FC } from 'react';
import { MantineProvider } from '@mantine/core';
// import { Notifications } from '@mantine/notifications';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';

import Home from './pages/Home';
import Login from './pages/Login';
// import Settings from './pages/Settings';

const App: FC = () => {
  return (
    <MantineProvider defaultColorScheme="dark">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </MantineProvider>
  );
};

export default App;
