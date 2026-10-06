import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // xlsx y jspdf pesan ~500 kB, pero se cargan bajo demanda (solo al exportar),
    // así que no afectan la carga inicial de la app.
    chunkSizeWarningLimit: 600,
  },
});
