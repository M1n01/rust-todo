import { FC, useEffect } from 'react';
import Layout from '../components/Layout';
import init, { greet } from '../../wasm/pkg/wasm';

const Home: FC = () => {
  useEffect(() => {
    init();
  }, []);

  return (
    <Layout>
      <div className="card">
        <button onClick={() => greet('App')}>greet</button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">Click on the Vite and React logos to learn more</p>
    </Layout>
  );
};

export default Home;
