import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      allow: [
        // 他の許可されたディレクトリ
        './wasm/pkg',
        './src',
        './node_modules',
      ],
    },
  },
});
