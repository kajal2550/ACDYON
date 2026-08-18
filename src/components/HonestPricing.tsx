import React, { useState } from 'react';
import { Check, ShieldCheck, Server, ArrowRight } from 'lucide-react';

export const HonestPricing: React.FC = () => {
  const [reqVolume, setReqVolume] = useState<number>(1.5); // Millions of requests

  // Calculate estimated price ($29 base includes 5M, then $5 per additional 1M)
  const calculateCost = (volumeInMillions: number) => {
    if (volumeInMillions <= 0.1) return 0;
    if (volumeInMillions <= 5) return 29;
    const extraMillions = Math.ceil(volumeInMillions - 5);
    return 29 + extraMillions * 5;
  };

  const estimatedMonthly = calculateCost(reqVolume);

  return (
    <section id="pricing" className="section" style={{ background: 'var(--bg-secondary)', borderTop: '1px solid var(--border-subtle)' }}>
      <div className="container">
        
        <div className="section-header">
          <div className="badge badge-status-orange" style={{ marginBottom: '0.75rem' }}>
            <span>Transparent Developer Pricing</span>
          </div>
          <h2>Honest Tiers. Zero Ingestion Penalties.</h2>
          <p>
            No fabricated 5-star quotes, no fake enterprise logos, and no bait-and-switch pricing. Pay for edge compute and caching, or run our open-core binary on your own infrastructure for free.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid-3" style={{ marginBottom: '3.5rem' }}>
          
          {/* Card 1: Free Developer */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="badge badge-status-green" style={{ marginBottom: '0.5rem' }}>Hobby & Solo</span>
              <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>Developer</h3>
              <p style={{ fontSize: '0.875rem' }}>For side projects, indie hackathons, and early MVPs.</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>$0</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}> / forever</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Check size={16} color="var(--accent-emerald)" />
                <span>100,000 monthly requests</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Check size={16} color="var(--accent-emerald)" />
                <span>Up to 3 protected endpoints</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Check size={16} color="var(--accent-emerald)" />
                <span>Autonomous Circuit Breaker</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Check size={16} color="var(--accent-emerald)" />
                <span>Stale-While-Revalidate Edge Cache</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>
                <span>• Community Discord Support</span>
              </div>
            </div>

            <a href="#simulator" className="btn btn-secondary" style={{ width: '100%' }}>
              <span>Get Free API Key</span>
            </a>
          </div>

          {/* Card 2: Production Team (Featured) */}
          <div className="card" style={{
            padding: '2rem',
            display: 'flex',
            flexDirection: 'column',
            border: '2px solid var(--accent-primary)',
            boxShadow: '0 10px 40px -10px var(--accent-primary-glow)'
          }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className="badge badge-status-orange" style={{ marginBottom: '0.5rem' }}>Most Popular</span>
                <span className="badge" style={{ fontSize: '0.75rem' }}>99.99% SLA</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>Production Team</h3>
              <p style={{ fontSize: '0.875rem' }}>For shipping frontend apps with strict uptime guarantees.</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>$29</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}> / month</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                <Check size={16} color="var(--accent-primary)" />
                <span>5,000,000 included requests/mo</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Check size={16} color="var(--accent-primary)" />
                <span>Unlimited upstream endpoints</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Check size={16} color="var(--accent-primary)" />
                <span>Real-Time Schema Drift Webhooks</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Check size={16} color="var(--accent-primary)" />
                <span>Dedicated Global Edge Routing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Check size={16} color="var(--accent-primary)" />
                <span>One-click Failing cURL Replay & Diffs</span>
              </div>
            </div>

            <a href="#simulator" className="btn btn-primary" style={{ width: '100%' }}>
              <span>Start 14-Day Free Trial</span>
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Card 3: Open-Core Self-Hosted */}
          <div className="card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className="badge" style={{ marginBottom: '0.5rem' }}>Apache 2.0</span>
              <h3 style={{ fontSize: '1.5rem', marginTop: '0.25rem' }}>Self-Hosted</h3>
              <p style={{ fontSize: '0.875rem' }}>Run our lightweight Rust/Go proxy in your own Kubernetes cluster.</p>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Free</span>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}> / Open Source</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2rem', flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Server size={16} color="var(--accent-cyan)" />
                <span>100% data sovereignty (Zero phone-home)</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Check size={16} color="var(--accent-cyan)" />
                <span>Docker, Helm, & Terraform modules</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Check size={16} color="var(--accent-cyan)" />
                <span>Local Redis / Memory cache backend</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <Check size={16} color="var(--accent-cyan)" />
                <span>Prometheus & Grafana metrics exporter</span>
              </div>
            </div>

            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ width: '100%' }}>
              <span>View GitHub Repository</span>
            </a>
          </div>

        </div>

        {/* Interactive Usage Estimator Calculator */}
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto', padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
            <ShieldCheck size={22} color="var(--accent-primary)" />
            <h4 style={{ fontSize: '1.125rem', margin: 0 }}>Predictable Traffic Cost Estimator</h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                <span>Monthly Request Volume</span>
                <span className="mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                  {reqVolume < 1 ? `${(reqVolume * 1000).toFixed(0)}k` : `${reqVolume.toFixed(1)}M`} reqs / mo
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="25"
                step="0.5"
                value={reqVolume}
                onChange={(e) => setReqVolume(Number(e.target.value))}
                className="custom-range"
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.35rem' }}>
                <span>100k (Free)</span>
                <span>5M ($29)</span>
                <span>25M ($129)</span>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-tertiary)',
              padding: '1rem',
              borderRadius: '10px',
              textAlign: 'center',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Estimated Cost
              </div>
              <div className="mono" style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--accent-primary)' }}>
                ${estimatedMonthly}
                <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>/mo</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.2rem' }}>
                {reqVolume <= 0.1 ? 'Included in Free Developer Tier' : 'Includes 99.99% Edge SLA'}
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
