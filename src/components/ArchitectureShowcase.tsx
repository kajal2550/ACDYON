import React, { useState } from 'react';
import { ShieldCheck, RefreshCw, GitBranch, Terminal, CheckCircle } from 'lucide-react';

interface Pillar {
  id: string;
  title: string;
  badge: string;
  tagline: string;
  icon: React.ReactNode;
  description: string;
  codeSnippet: string;
  diagramTitle: string;
  bullets: string[];
}

const PILLARS: Pillar[] = [
  {
    id: 'circuit-breaker',
    title: 'Adaptive Circuit Breaking',
    badge: 'Reliability Tier 1',
    tagline: 'Fail fast at the edge before upstream timeouts cascade into your UI thread.',
    icon: <ShieldCheck size={24} color="var(--accent-primary)" />,
    description: 'When upstream third parties begin returning 500s or 504 timeouts, Syntropy automatically trips the circuit to OPEN after a configurable error threshold (default 3 consecutive errors or >15% rate). It serves deterministic, fresh-enough cache snapshots while asynchronously probing upstream with exponential jitter.',
    codeSnippet: `// syntropy.config.ts
export default defineConfig({
  circuitBreaker: {
    failureThreshold: 3,
    resetTimeoutMs: 15000,
    halfOpenMaxProbes: 2,
    fallback: {
      strategy: "stale-while-revalidate",
      maxStaleAgeSec: 3600, // 1 hour max stale
      headerFlag: "x-syntropy-fallback"
    }
  }
});`,
    diagramTitle: 'State Machine: Closed ➔ Open ➔ Half-Open Probing',
    bullets: [
      'Zero frontend freeze: Instant 4ms response instead of 30s browser timeout.',
      'Prevents upstream thundering herds when the external vendor recovers.',
      'Configurable per-route SLAs, error status codes (5xx, 429, 408), and timeout limits.'
    ]
  },
  {
    id: 'schema-sentry',
    title: 'Zero-Day Schema Drift Sentry',
    badge: 'Data Integrity',
    tagline: 'Catch breaking upstream JSON mutations before they cause "TypeError: Cannot read properties of undefined".',
    icon: <GitBranch size={24} color="var(--accent-cyan)" />,
    description: 'Third-party APIs frequently alter response shapes without incrementing version numbers (e.g., renaming `id` to `_id`, turning objects into arrays, or dropping fields). Syntropy matches every live response against your validated Zod or JSON Schema, healing minor discrepancies and flagging breaking mutations.',
    codeSnippet: `// contracts/job-listing.ts
import { z } from 'zod';

export const JobListingContract = z.object({
  id: z.string(),
  title: z.string(),
  company: z.string(),
  salary: z.number().optional().default(0),
  tags: z.array(z.string()).default([])
});

// Syntropy auto-normalizes incoming upstream payload against this contract`,
    diagramTitle: 'Continuous JSON Diff & Edge Normalization Pipeline',
    bullets: [
      'Automatic fallback to default contract values when upstream keys are omitted.',
      'Slack/Webhook alerts sent the instant an upstream vendor changes response types.',
      'No runtime TypeScript crash in your Next.js / React server or client components.'
    ]
  },
  {
    id: 'jitter-backoff',
    title: 'Smart Jitter & Edge Replay',
    badge: 'Ingestion Stealth & Evasion',
    tagline: 'Defeat strict 429 rate limiters with decorrelated jittered backoff.',
    icon: <RefreshCw size={24} color="var(--accent-emerald)" />,
    description: 'Fixed-interval retries get your IP address immediately flagged by Cloudflare or Akamai bot management. Syntropy employs decorrelated jittered exponential backoff (Full Jitter formula: sleep = min(cap, random(base, sleep * 3))) across geographically distributed edge nodes.',
    codeSnippet: `// Edge Backoff Execution
const calculateJitter = (attempt: number, baseMs = 200, capMs = 5000) => {
  const temp = Math.min(capMs, baseMs * 2 ** attempt);
  const sleep = Math.floor(Math.random() * (temp - baseMs) + baseMs);
  return sleep;
};

// Replays failing upstream requests across 320+ rotating edge PoPs`,
    diagramTitle: 'Decorrelated Jitter vs Fixed Retries under Burst Load',
    bullets: [
      'Bypasses synchronized burst detection algorithms on enterprise API firewalls.',
      'Instant one-click cURL export for failing requests for effortless local reproduction.',
      'Seamless upstream token bucket rate smoothing.'
    ]
  }
];

export const ArchitectureShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('circuit-breaker');
  const currentPillar = PILLARS.find(p => p.id === activeTab) || PILLARS[0];

  return (
    <section id="architecture" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="badge badge-status-green" style={{ marginBottom: '0.75rem' }}>
            <span>Architecture & Systems Thinking</span>
          </div>
          <h2>Built for the Worst-Case Upstream Scenario</h2>
          <p>
            When external vendors fail, your application shouldn't. Here is how Syntropy protects your frontend layer from the ground up.
          </p>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '0.75rem',
          flexWrap: 'wrap',
          marginBottom: '2.5rem'
        }}>
          {PILLARS.map(pillar => (
            <button
              key={pillar.id}
              onClick={() => setActiveTab(pillar.id)}
              className={`btn ${activeTab === pillar.id ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.75rem 1.25rem', fontSize: '0.9375rem' }}
            >
              {pillar.icon}
              <span>{pillar.title}</span>
            </button>
          ))}
        </div>

        {/* Pillar Card Detailed View */}
        <div className="card" style={{ padding: '2rem', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
            
            {/* Left: Deep Technical Context */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                <span className="badge badge-status-orange">{currentPillar.badge}</span>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{currentPillar.title}</h3>
              </div>

              <p style={{ fontSize: '1.0625rem', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '1rem' }}>
                {currentPillar.tagline}
              </p>

              <p style={{ fontSize: '0.9375rem', lineHeight: '1.7', marginBottom: '1.5rem' }}>
                {currentPillar.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {currentPillar.bullets.map((bullet, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.875rem' }}>
                    <div style={{ color: 'var(--accent-emerald)', marginTop: '2px' }}><CheckCircle size={16} /></div>
                    <span style={{ color: 'var(--text-secondary)' }}>{bullet}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Concrete Code Implementation */}
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px 8px 0 0',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: 'none'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  <Terminal size={14} />
                  <span className="mono">Production Configuration</span>
                </div>
                <span className="badge" style={{ fontSize: '0.75rem' }}>Edge V8 Native</span>
              </div>

              <div className="code-block" style={{ borderRadius: '0 0 8px 8px', flex: 1, minHeight: '260px' }}>
                <pre style={{ margin: 0, fontSize: '0.8125rem', lineHeight: '1.6' }}>
                  {currentPillar.codeSnippet}
                </pre>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
