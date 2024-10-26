import { FC } from 'react';
import { AppShell } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Navbar from './Navbar';
import Header from './Header';
import Footer from './Footer';

const Layout: FC<{ children: React.ReactNode }> = ({ children }) => {
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
      <Navbar />
      <AppShell.Main>{children}</AppShell.Main>
      <Footer />
    </AppShell>
  );
};

export default Layout;
