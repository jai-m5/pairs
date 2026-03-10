import ReactDOM from 'react-dom/client';
import App from './App';

const root = document.getElementById('root');
if (!root) {
  console.error('Root element not found');
  throw new Error('Root element not found');
}

try {
  ReactDOM.createRoot(root).render(
    <App />
  );
} catch (error) {
  console.error('App render error:', error);
  root.innerHTML = '<div style="padding: 20px; color: red; font-family: monospace;"><h2>⚠️ App Error</h2><pre>' + String(error) + '</pre></div>';
}
