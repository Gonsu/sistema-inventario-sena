import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { inicializarAlmacenamiento } from './services/bootstrap';
import './index.css';

void inicializarAlmacenamiento().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
