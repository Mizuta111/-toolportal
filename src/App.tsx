// src/App.tsx
import { Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Portal from './pages/Portal';
import ReplacerPage from './pages/ReplacerPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Portal />} />
        <Route path="replacer" element={<ReplacerPage />} />
      </Route>
    </Routes>
  );
}

export default App;