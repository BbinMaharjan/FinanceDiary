import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { themeConfig } from './lib/antdConfig';
import App from './App';

function Root() {
  return (
    <BrowserRouter>
      <ConfigProvider theme={themeConfig}>
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
}

createRoot(document.getElementById('root')).render(<Root />);
