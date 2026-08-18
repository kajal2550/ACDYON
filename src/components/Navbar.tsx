import React from 'react';
import { Zap, Sun, Moon, Terminal, ShieldAlert } from 'lucide-react';

interface NavbarProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  openTerminal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ theme, toggleTheme, openTerminal }) => {
  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <a href="#" className="nav-logo">
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(249, 115, 22, 0.4)'
          }}>
            <Zap size={20} color="#ffffff" />
          </div>
          <span>Syntropy<span style={{ color: 'var(--accent-primary)' }}>.io</span></span>
        </a>

        <nav>
          <ul className="nav-links">
            <li><a href="#simulator">Live Simulator</a></li>
            <li><a href="#architecture">Architecture</a></li>
            <li><a href="#sdks">Quickstart</a></li>
            <li><a href="#pricing">Pricing & Limits</a></li>
          </ul>
        </nav>

        <div className="nav-actions">
          {/* Live Edge Status */}
          <div className="badge badge-status-green" style={{ fontSize: '0.75rem', display: 'none', gap: '0.35rem' }}>
            <span className="pulse-dot"></span>
            <span>Edge: 2.4ms</span>
          </div>

          {/* Secret Terminal Trigger */}
          <button
            onClick={openTerminal}
            className="btn btn-ghost btn-sm"
            title="Open Developer Terminal (or press ~)"
            style={{ padding: '0.45rem', borderRadius: '8px' }}
          >
            <Terminal size={18} />
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="btn btn-secondary btn-sm"
            aria-label="Toggle theme"
            style={{ padding: '0.45rem', borderRadius: '8px' }}
          >
            {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#6366f1" />}
          </button>

          <a href="#simulator" className="btn btn-primary btn-sm">
            <ShieldAlert size={16} />
            <span>Launch Gateway</span>
          </a>
        </div>
      </div>
    </header>
  );
};
