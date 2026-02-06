// src/pages/Portal.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const Portal: React.FC = () => {
  return (
    <div className="portal-container">
      <h2>ツール一覧</h2>
      <p>利用可能なツールの一覧です。</p>
      <div className="tool-card-grid">
        <div className="tool-card">
          <div className="tool-card-content">
            <h3>画像パス置換ツール</h3>
            <p>HTML/CSSコード内の画像パスを、指定された形式に一括で置換します。</p>
          </div>
          <div className="tool-card-footer">
            <Link to="/replacer" className="tool-link-button">
              ツールへ
              <svg xmlns="http://www.w3.org/2000/svg" className="button-icon-small" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
        {/* Add other tool cards here in the future */}
      </div>
    </div>
  );
};

export default Portal;
