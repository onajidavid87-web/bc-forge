import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

const sdkDir = path.resolve(__dirname, '../../sdk').replace(/\\/g, '/');
const reactDir = path.resolve(__dirname, '../../react').replace(/\\/g, '/');

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'fix-stellar-sdk-imports',
      enforce: 'pre',
      transform(code, id) {
        const normalizedId = id.replace(/\\/g, '/');
        if (normalizedId.startsWith(sdkDir) || normalizedId.startsWith(reactDir)) {
          return code.replace(/\bSorobanRpc\b/g, 'rpc');
        }
        return null;
      },
    },
  ],
  resolve: {
    alias: {
      '@bc-forge/sdk': path.resolve(__dirname, '../../sdk/src'),
      '@bc-forge/react': path.resolve(__dirname, '../../react/src'),
    },
  },
});
