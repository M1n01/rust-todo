import { FC } from 'react';
import { AppShell, Burger, Group, Title } from '@mantine/core';

const Header: FC<{ opened: boolean; toggle: () => void }> = ({ opened, toggle }) => {
  return (
    <AppShell.Header p="md">
      <Group h="100%" px="md">
        <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
        <Title>App Title</Title>
      </Group>
    </AppShell.Header>
  );
};

export default Header;
