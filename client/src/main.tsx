import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { getThemeConfig } from './lib/antdConfig';
import App from './App';

function ThemedApp() {
  const { dark } = useTheme();
  const config = getThemeConfig(dark);

  return (
    <ConfigProvider theme={config}>
      <App />
    </ConfigProvider>
  );
}

function Root() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ThemedApp />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element not found');
createRoot(rootElement).render(<Root />);
