import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Global fetch interceptor to duplicate Authorization header as X-Authorization.
// This bypasses web server configurations (Apache/Nginx/LiteSpeed CGI) that strip standard Authorization headers.
const originalFetch = window.fetch;
window.fetch = function (input, init) {
  if (init && init.headers) {
    if (init.headers instanceof Headers) {
      if (init.headers.has('Authorization')) {
        init.headers.set('X-Authorization', init.headers.get('Authorization'));
      }
    } else if (Array.isArray(init.headers)) {
      const authHeader = init.headers.find(h => h[0] && h[0].toLowerCase() === 'authorization');
      if (authHeader) {
        init.headers.push(['X-Authorization', authHeader[1]]);
      }
    } else if (typeof init.headers === 'object') {
      const authKey = Object.keys(init.headers).find(k => k.toLowerCase() === 'authorization');
      if (authKey) {
        init.headers['X-Authorization'] = init.headers[authKey];
      }
    }
  }
  return originalFetch.apply(this, arguments);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
