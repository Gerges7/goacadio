import { reactRouter } from '@react-router/dev/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vite';

// Browser tests use the standard local Node adapter. This avoids requiring
// Cloudflare credentials or remote Workers AI access merely to render pages.
export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
});
