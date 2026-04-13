import React, { useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { useStore } from './store/useStore';
import Layout from './components/Layout';
import Home from './pages/Home';
import Chat from './pages/Chat';
import Settings from './pages/Settings';
import Files from './pages/Files';
import Skills from './pages/Skills';

function App() {
  const navigate = useNavigate();
  const { setDockerStatus, setDeerflowStatus, theme } = useStore();

  useEffect(() => {
    // Check service status periodically
    const checkStatus = async () => {
      try {
        const dockerResult = await window.electronAPI.checkServiceStatus(2375);
        setDockerStatus(dockerResult.running);
      } catch {
        setDockerStatus(false);
      }

      try {
        const deerflowResult = await window.electronAPI.checkServiceStatus(2026);
        setDeerflowStatus(deerflowResult.running);
      } catch {
        setDeerflowStatus(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);

    // Listen for navigation from tray
    window.electronAPI.onNavigate((path) => {
      navigate(path);
    });

    return () => clearInterval(interval);
  }, [navigate, setDockerStatus, setDeerflowStatus]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/chat/:id" element={<Chat />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/files" element={<Files />} />
        <Route path="/skills" element={<Skills />} />
      </Routes>
    </Layout>
  );
}

export default App;
