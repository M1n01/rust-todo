import { FC, useState } from 'react';
import { AppShell } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconHome, IconSettings, IconLogout } from '@tabler/icons-react';
import classes from './Navbar.module.css';

const mockdata = [{ label: 'Home', icon: IconHome, path: '/' }];

const Navbar: FC = () => {
  const [active, setActive] = useState('Billing');
  const navigate = useNavigate();
  const links = mockdata.map((item) => (
    <a
      className={classes.link}
      data-active={item.label === active || undefined}
      key={item.label}
      href={item.path}
      onClick={(event) => {
        event.preventDefault();
        setActive(item.label);
        navigate(item.path);
      }}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </a>
  ));

  return (
    <AppShell.Navbar p="md">
      <div className={classes.navbarMain}>{links}</div>

      <div className={classes.footer}>
        <a href="/settings" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconSettings className={classes.linkIcon} stroke={1.5} />
          <span>Settings</span>
        </a>

        <a href="#" className={classes.link} onClick={(event) => event.preventDefault()}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </AppShell.Navbar>
  );
};

export default Navbar;
