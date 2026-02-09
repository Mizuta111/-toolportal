// src/components/layout/MainLayout.tsx
import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const MainLayout: React.FC = () => {
  return (
    <div className="app-container">
      <header className="app-header">
        <Link to="/" className="header-title-link">
          <h1>Tool Portal</h1>
        </Link>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-footer">
        <p>&copy; 2026 Tool Portal. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default MainLayout;
