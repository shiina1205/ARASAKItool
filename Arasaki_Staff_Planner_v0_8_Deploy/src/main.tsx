import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppBootstrap } from './AppBootstrap';

const root = document.getElementById('reactBootstrap');

if (!root) {
  throw new Error('React bootstrap root が見つかりません');
}

createRoot(root).render(
  <StrictMode>
    <AppBootstrap />
  </StrictMode>,
);
