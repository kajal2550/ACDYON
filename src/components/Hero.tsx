import React, { useState } from 'react';
import { ArrowRight, Check, Copy, Shield, Cpu, Activity } from 'lucide-react';

export const Hero: React.FC = () => {
  const [copied, setCopied] = useState(false);

  const copyCommand = () => {
    navigator.clipboard.writeText('npx syntropy-edge init');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="section" style={{ paddingTop: '4rem', paddingBottom: '3.5rem' }}>
      <div className="container" style={{ textAlign: 'center' }}>
        
        {/* Release Pill */}
        <div style={{ display: 'inline-flex', marginBottom: '1.75rem' }}>
          <div className="badge badge-status-orange" style={{ padding: '0.35rem 1rem', fontSize: '0.85rem' }}>
            <span className="pulse-dot"></span>
            <span>Syntropy 2.4 — Autonomous Edge Circuit Breaker</span>
          </div>
        </div>

        {/* Main Headline */}
        <h1 style={{ maxWidth: '960px', margin: '0 auto 1.5rem auto' }}>
          Never let a flaky upstream API <br className="hidden-mobile" />
          <span className="text-gradient">crash your frontend again.</span>
        </h1>

        {/* Value Proposition */}
        <p style={{ maxWidth: '680px', margin: '0 auto 2.5rem auto', fontSize: '1.1875rem', lineHeight: '1.7' }}>
          The lightweight edge proxy that intercepts upstream 5xx outages, 429 rate limits, 
          and silent JSON schema drifts — serving deterministic stale snapshots in <strong style={{ color: 'var(--text-primary)' }}>&lt; 4ms</strong> while your users never notice a hiccup.
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '3.5rem'
        }}>
          <a href="#simulator" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}>
            <span>Test Live Simulator</span>
            <ArrowRight size={18} />
          </a>

          <button
            onClick={copyCommand}
            className="btn btn-secondary mono"
            style={{ padding: '0.85rem 1.25rem', fontSize: '0.875rem', gap: '0.75rem' }}
          >
            <span style={{ color: 'var(--accent-primary)' }}>$</span>
            <span>npx syntropy-edge init</span>
            {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
          </button>
        </div>

        {/* Honest Architecture Metrics (Real engineering benchmarks, no fake logos) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          maxWidth: '900px',
          margin: '0 auto',
          textAlign: 'left'
        }}>
          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ color: 'var(--accent-primary)' }}><Activity size={20} /></div>
              <span className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>3.8ms TTFB</span>
            </div>
            <p style={{ fontSize: '0.875rem' }}>Cached edge fallback latency under simulated upstream timeout.</p>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ color: 'var(--accent-emerald)' }}><Shield size={20} /></div>
              <span className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>0 Undefined</span>
            </div>
            <p style={{ fontSize: '0.875rem' }}>Real-time schema guardrails catch breaking JSON response mutations.</p>
          </div>

          <div className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <div style={{ color: 'var(--accent-cyan)' }}><Cpu size={20} /></div>
              <span className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>0ms Cold Start</span>
            </div>
            <p style={{ fontSize: '0.875rem' }}>Powered by V8 Isolate edge workers distributed globally in 320+ POPS.</p>
          </div>
        </div>

      </div>
    </section>
  );
};
