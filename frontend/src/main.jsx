
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { ConsentProvider } from './context/Consent.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <ConsentProvider>
      <AppProvider>
        <App />
      </AppProvider>
    </ConsentProvider>
  </BrowserRouter>
);
