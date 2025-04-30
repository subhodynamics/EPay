import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': {
        target: 'http://ec2-65-1-135-132.ap-south-1.compute.amazonaws.com:3000',
        changeOrigin: true,
        secure: false,
      },
      '/transactions': {
        target: 'http://ec2-65-1-135-132.ap-south-1.compute.amazonaws.com:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});