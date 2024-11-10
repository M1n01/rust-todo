import { FC } from 'react';
import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Header from './Header';
import Footer from './Footer';

const Layout: FC<{ children: React.ReactNode; navbar: React.ReactNode }> = ({ children, navbar }) => {
  const [opened, { toggle }] = useDisclosure(false);

  return (
    <AppShell
      header={{ height: 60 }}
      footer={{ height: 40 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      aside={{ width: 300, breakpoint: 'md', collapsed: { desktop: false, mobile: true } }}
      padding="md"
    >
      <Header opened={opened} toggle={toggle} />
      {navbar}
      <AppShell.Main>{children}</AppShell.Main>
      <Footer />
    </AppShell>
  );
};

export default Layout;
