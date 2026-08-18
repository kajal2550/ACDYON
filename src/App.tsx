import React, { useState, useEffect, useCallback } from 'react';
import './styles/main.css';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { LiveSimulator } from './components/LiveSimulator';
import { ArchitectureShowcase } from './components/ArchitectureShowcase';
import { CodeMatrix } from './components/CodeMatrix';
import { HonestPricing } from './components/HonestPricing';
import { Footer } from './components/Footer';
import { EasterEggTerminal } from './components/EasterEggTerminal';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isTerminalOpen, setIsTerminalOpen] = useState<boolean>(false);
  const konamiSequenceRef = React.useRef<string[]>([]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Konami Code Sequence: Up, Up, Down, Down, Left, Right, Left, Right, b, a
  const KONAMI_CODE = React.useMemo(() => [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ], []);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Quick shortcut: Tilde or Backtick
    if (e.key === '`' || e.key === '~') {
      e.preventDefault();
      setIsTerminalOpen(prev => !prev);
      return;
    }

    // Escape closes terminal
    if (e.key === 'Escape') {
      setIsTerminalOpen(false);
      return;
    }

    // Konami sequence tracker
    konamiSequenceRef.current = [...konamiSequenceRef.current, e.key].slice(-KONAMI_CODE.length);
    const isMatch = KONAMI_CODE.every((key, idx) => konamiSequenceRef.current[idx]?.toLowerCase() === key.toLowerCase());
    if (isMatch) {
      setIsTerminalOpen(true);
      konamiSequenceRef.current = [];
    }
  }, [KONAMI_CODE]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="app-root">
      {/* Background ambient lighting and grid */}
      <div className="bg-grid" />
      <div className="ambient-glow" />

      {/* Main Navigation */}
      <Navbar
        theme={theme}
        toggleTheme={toggleTheme}
        openTerminal={() => setIsTerminalOpen(true)}
      />

      {/* Main Content Flow */}
      <main>
        <Hero />
        <LiveSimulator />
        <ArchitectureShowcase />
        <CodeMatrix />
        <HonestPricing />
      </main>

      {/* Footer */}
      <Footer openTerminal={() => setIsTerminalOpen(true)} />

      {/* Easter Egg Matrix Console Modal */}
      <EasterEggTerminal
        isOpen={isTerminalOpen}
        onClose={() => setIsTerminalOpen(false)}
      />
    </div>
  );
};

export default App;
