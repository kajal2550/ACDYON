import React from 'react';
import { Zap, Terminal, ArrowUp } from 'lucide-react';

interface FooterProps {
  openTerminal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ openTerminal }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{
      background: 'var(--bg-primary)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '4.5rem 0 2.5rem 0',
      position: 'relative'
    }}>
      <div className="container">
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3.5rem'
        }}>
          
          {/* Col 1: Brand */}
          <div style={{ gridColumn: 'span 2' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Zap size={16} color="#ffffff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--text-primary)' }}>
                Syntropy<span style={{ color: 'var(--accent-primary)' }}>.io</span>
              </span>
            </div>

            <p style={{ maxWidth: '340px', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
              The resilient edge gateway shielding modern frontend applications from upstream API outages, rate limits, and breaking schema drift.
            </p>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem' }} className="badge badge-status-green">
              <span className="pulse-dot"></span>
              <span>All 320 Edge PoPs Operational (99.999% uptime)</span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div>
            <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Architecture
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><a href="#simulator" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Live Chaos Simulator</a></li>
              <li><a href="#architecture" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Circuit Breaking State Machine</a></li>
              <li><a href="#architecture" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Schema Drift Sentry</a></li>
              <li><a href="#architecture" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Decorrelated Jitter Strategy</a></li>
            </ul>
          </div>

          {/* Col 3: Resources & Secret */}
          <div>
            <h4 style={{ fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Developer Tools
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><a href="#sdks" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>TypeScript / Node SDK</a></li>
              <li><a href="#sdks" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Python FastAPI Client</a></li>
              <li><a href="#pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none' }}>Self-Hosted Open Core</a></li>
              <li>
                <button
                  onClick={openTerminal}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--accent-primary)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <Terminal size={14} />
                  <span>Launch Matrix Console (~ or Konami Code)</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Strip */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: 'var(--text-tertiary)'
        }}>
          <div>
            © {new Date().getFullYear()} Syntropy Gateway. Built for the <strong style={{ color: 'var(--text-secondary)' }}>Acdyon Frontend Challenge</strong>.
          </div>

          <button
            onClick={scrollToTop}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.75rem', gap: '0.35rem' }}
          >
            <span>Back to top</span>
            <ArrowUp size={14} />
          </button>
        </div>

      </div>
    </footer>
  );
};
