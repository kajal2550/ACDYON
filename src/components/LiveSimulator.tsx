import React, { useState } from 'react';
import { 
  Play, RefreshCw, AlertTriangle, CheckCircle2, 
  Layers, Lock, Database
} from 'lucide-react';

interface Scenario {
  id: string;
  name: string;
  endpoint: string;
  defaultLatency: number;
  mockFresh: object;
  mockStale: object;
  mockBrokenSchema: object;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'payment',
    name: 'Payment Webhook (Stripe/Fintech)',
    endpoint: 'https://api.gateway.syntropy.io/v1/payments/verify',
    defaultLatency: 650,
    mockFresh: {
      status: "success",
      transaction_id: "tx_9482710492",
      amount_cents: 4900,
      currency: "usd",
      state: "settled",
      risk_score: 0.02,
      verified_at: "2026-08-18T11:32:00Z"
    },
    mockStale: {
      status: "success",
      transaction_id: "tx_9482710492",
      amount_cents: 4900,
      currency: "usd",
      state: "settled",
      _syntropy_metadata: {
        served_from: "edge_snapshot",
        cache_age_seconds: 42,
        upstream_status: 504,
        client_impact: "zero_disruption"
      }
    },
    mockBrokenSchema: {
      result: "ok", // key renamed from 'status' to 'result'
      txn: "tx_9482710492", // key renamed from 'transaction_id'
      amount: "49.00" // type mutated from number to string!
    }
  },
  {
    id: 'ai',
    name: 'AI Inference Router (Claude/GPT-4o)',
    endpoint: 'https://api.gateway.syntropy.io/v1/inference/completion',
    defaultLatency: 1200,
    mockFresh: {
      model: "claude-3-5-sonnet",
      usage: { prompt_tokens: 120, completion_tokens: 45 },
      output: "Summary: Ingestion pipeline initialized with backoff jitter.",
      latency_ms: 812
    },
    mockStale: {
      model: "claude-3-5-sonnet",
      usage: { prompt_tokens: 120, completion_tokens: 45 },
      output: "Summary: Ingestion pipeline initialized with backoff jitter (Edge cached fallback).",
      _syntropy_metadata: {
        upstream_error: "429 Too Many Requests",
        served_from: "semantic_edge_cache",
        latency_ms: 3.4
      }
    },
    mockBrokenSchema: {
      error: null,
      data: ["Summary: Ingestion pipeline initialized"] // mutated from object to array!
    }
  },
  {
    id: 'jobfeed',
    name: 'Public Job Feed Ingestion (Aggregator)',
    endpoint: 'https://api.gateway.syntropy.io/v1/feeds/jobs',
    defaultLatency: 450,
    mockFresh: {
      source: "wellfound-syndicate",
      total_listings: 14,
      jobs: [
        { id: "jb-801", title: "Senior Frontend Engineer", company: "Acdyon Technologies", location: "Remote" },
        { id: "jb-802", title: "Systems Engineer (Ingestion)", company: "Acdyon Technologies", location: "Hybrid" }
      ]
    },
    mockStale: {
      source: "wellfound-syndicate",
      total_listings: 14,
      jobs: [
        { id: "jb-801", title: "Senior Frontend Engineer", company: "Acdyon Technologies", location: "Remote" },
        { id: "jb-802", title: "Systems Engineer (Ingestion)", company: "Acdyon Technologies", location: "Hybrid" }
      ],
      _syntropy_metadata: {
        served_from: "stale_while_revalidate_vault",
        upstream_error: "502 Bad Gateway",
        fallback_ttl_remaining: "180s"
      }
    },
    mockBrokenSchema: {
      // Missing 'jobs' array entirely!
      source: "wellfound-syndicate",
      count: 0
    }
  }
];

export const LiveSimulator: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<Scenario>(SCENARIOS[0]);
  const [failureRate, setFailureRate] = useState<number>(60);
  const [upstreamLatency, setUpstreamLatency] = useState<number>(650);
  
  // Toggles
  const [circuitBreakerEnabled, setCircuitBreakerEnabled] = useState<boolean>(true);
  const [staleFallbackEnabled, setStaleFallbackEnabled] = useState<boolean>(true);
  const [schemaSentryEnabled, setSchemaSentryEnabled] = useState<boolean>(true);
  const [simulateSchemaDrift, setSimulateSchemaDrift] = useState<boolean>(false);

  // Simulation State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [circuitState, setCircuitState] = useState<'CLOSED' | 'OPEN' | 'HALF_OPEN'>('CLOSED');
  const [consecutiveFailures, setConsecutiveFailures] = useState<number>(0);
  
  // Result
  const [lastResult, setLastResult] = useState<{
    status: number;
    statusText: string;
    origin: 'UPSTREAM_FRESH' | 'EDGE_FALLBACK' | 'UPSTREAM_FAILED' | 'SCHEMA_HEALED' | 'SCHEMA_CORRUPTED';
    durationMs: number;
    payload: object;
    headers: Record<string, string>;
    timestamp: string;
  }>({
    status: 200,
    statusText: 'OK',
    origin: 'UPSTREAM_FRESH',
    durationMs: 4.2,
    payload: SCENARIOS[0].mockFresh,
    headers: {
      'content-type': 'application/json',
      'x-syntropy-circuit': 'CLOSED',
      'x-syntropy-origin': 'edge-cache-fresh',
      'x-syntropy-latency': '4.2ms'
    },
    timestamp: new Date().toLocaleTimeString()
  });

  // Event Log
  const [logs, setLogs] = useState<Array<{ id: number; time: string; msg: string; type: 'info' | 'warn' | 'error' | 'success' }>>([
    { id: 1, time: '11:30:01', msg: 'Syntropy Edge Gateway connected (320 PoPs active)', type: 'info' },
    { id: 2, time: '11:30:05', msg: 'Circuit breaker initialized [threshold: 3 consecutive 5xx]', type: 'info' }
  ]);

  // Handle Scenario Change
  const handleScenarioChange = (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setUpstreamLatency(scenario.defaultLatency);
    setSimulateSchemaDrift(false);
  };

  // Run Request
  const runSimulationRequest = async () => {
    setIsProcessing(true);
    const isUpstreamFailure = Math.random() * 100 < failureRate;
    const now = new Date().toLocaleTimeString();

    // Circuit Breaker logic
    let currentCircuit = circuitState;
    if (circuitBreakerEnabled && consecutiveFailures >= 2 && isUpstreamFailure) {
      currentCircuit = 'OPEN';
      setCircuitState('OPEN');
    }

    // Simulate delay
    const targetDelay = (currentCircuit === 'OPEN' || (staleFallbackEnabled && isUpstreamFailure)) 
      ? Math.floor(Math.random() * 5 + 3) // Instant edge latency (3-8ms)
      : Math.min(upstreamLatency, 1500);

    setTimeout(() => {
      let finalStatus = 200;
      let finalStatusText = 'OK';
      let origin: 'UPSTREAM_FRESH' | 'EDGE_FALLBACK' | 'UPSTREAM_FAILED' | 'SCHEMA_HEALED' | 'SCHEMA_CORRUPTED' = 'UPSTREAM_FRESH';
      let payload: object = selectedScenario.mockFresh;

      if (simulateSchemaDrift) {
        if (schemaSentryEnabled) {
          origin = 'SCHEMA_HEALED';
          finalStatus = 200;
          finalStatusText = '200 OK (Schema Repaired by Syntropy Sentry)';
          payload = selectedScenario.mockFresh;
          setLogs(prev => [
            { id: Date.now(), time: now, msg: '⚠️ Upstream JSON mutated schema! Sentry transformed payload to match contract.', type: 'warn' },
            ...prev.slice(0, 8)
          ]);
        } else {
          origin = 'SCHEMA_CORRUPTED';
          finalStatus = 200;
          finalStatusText = '200 OK (Corrupted JSON Schema - React Crash Risk!)';
          payload = selectedScenario.mockBrokenSchema;
          setLogs(prev => [
            { id: Date.now(), time: now, msg: '🚨 Sentry disabled: Corrupted response passed to client. TypeError imminent!', type: 'error' },
            ...prev.slice(0, 8)
          ]);
        }
      } else if (currentCircuit === 'OPEN') {
        if (staleFallbackEnabled) {
          origin = 'EDGE_FALLBACK';
          finalStatus = 200;
          finalStatusText = '200 OK (Circuit OPEN — Served Stale Vault Snapshot)';
          payload = selectedScenario.mockStale;
          setLogs(prev => [
            { id: Date.now(), time: now, msg: '⚡ Circuit OPEN: Intercepted upstream failure, served fallback in 3.8ms.', type: 'success' },
            ...prev.slice(0, 8)
          ]);
        } else {
          origin = 'UPSTREAM_FAILED';
          finalStatus = 503;
          finalStatusText = '503 Service Unavailable (Circuit Breaker Tripped)';
          payload = { error: "Circuit open, fallback cache disabled" };
          setLogs(prev => [
            { id: Date.now(), time: now, msg: '🛑 Circuit OPEN and fallback disabled: Returned 503.', type: 'error' },
            ...prev.slice(0, 8)
          ]);
        }
      } else if (isUpstreamFailure) {
        setConsecutiveFailures(prev => prev + 1);
        if (staleFallbackEnabled) {
          origin = 'EDGE_FALLBACK';
          finalStatus = 200;
          finalStatusText = '200 OK (Upstream 504 Intercepted — Fallback Snapshot Served)';
          payload = selectedScenario.mockStale;
          setLogs(prev => [
            { id: Date.now(), time: now, msg: '🛡️ Upstream timed out. Syntropy served verified stale cache instantly.', type: 'success' },
            ...prev.slice(0, 8)
          ]);
        } else {
          origin = 'UPSTREAM_FAILED';
          finalStatus = 504;
          finalStatusText = '504 Gateway Timeout (Upstream Died)';
          payload = { error: "Upstream timeout. 0 responses returned to frontend." };
          setLogs(prev => [
            { id: Date.now(), time: now, msg: '❌ Upstream 504 reached client (Fallback cache was disabled).', type: 'error' },
            ...prev.slice(0, 8)
          ]);
        }
      } else {
        // Healthy fresh response
        setConsecutiveFailures(0);
        if (circuitState === 'OPEN') {
          setCircuitState('HALF_OPEN');
        } else {
          setCircuitState('CLOSED');
        }
        origin = 'UPSTREAM_FRESH';
        finalStatus = 200;
        finalStatusText = '200 OK (Upstream Live)';
        payload = selectedScenario.mockFresh;
        setLogs(prev => [
          { id: Date.now(), time: now, msg: `✅ Upstream responded healthy in ${targetDelay}ms.`, type: 'info' },
          ...prev.slice(0, 8)
        ]);
      }

      setLastResult({
        status: finalStatus,
        statusText: finalStatusText,
        origin,
        durationMs: targetDelay,
        payload,
        headers: {
          'content-type': 'application/json',
          'x-syntropy-circuit': currentCircuit,
          'x-syntropy-origin': origin === 'EDGE_FALLBACK' ? 'edge-stale-vault' : origin === 'SCHEMA_HEALED' ? 'schema-sentry-healed' : 'upstream-live',
          'x-syntropy-latency': `${targetDelay}ms`
        },
        timestamp: now
      });

      setIsProcessing(false);
    }, 280);
  };

  // Burst traffic test (5 requests in sequence)
  const runBurstTest = async () => {
    for (let i = 0; i < 5; i++) {
      await new Promise(r => setTimeout(r, 180));
      runSimulationRequest();
    }
  };

  // Reset circuit breaker
  const resetCircuit = () => {
    setCircuitState('CLOSED');
    setConsecutiveFailures(0);
    setLogs(prev => [
      { id: Date.now(), time: new Date().toLocaleTimeString(), msg: '🔄 Manual Reset: Circuit forced CLOSED.', type: 'info' },
      ...prev.slice(0, 8)
    ]);
  };

  return (
    <section id="simulator" className="section">
      <div className="container">
        
        {/* Section Header */}
        <div className="section-header">
          <div className="badge badge-status-orange" style={{ marginBottom: '0.75rem' }}>
            <span>Interactive Live Engine</span>
          </div>
          <h2>Experience Resilient Ingestion in Action</h2>
          <p>
            Tweak upstream latency, induce 5xx outages or schema drifts, and see how Syntropy’s circuit breaker and stale-while-revalidate cache shield your client in real time.
          </p>
        </div>

        {/* Simulator App Window */}
        <div className="simulator-container">
          
          {/* Header Bar */}
          <div className="simulator-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div className="window-dots">
                <div className="window-dot dot-red"></div>
                <div className="window-dot dot-yellow"></div>
                <div className="window-dot dot-green"></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                  GATEWAY:
                </span>
                <span className="mono" style={{ fontSize: '0.8125rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                  {selectedScenario.endpoint}
                </span>
              </div>
            </div>

            {/* Circuit State Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>Circuit State:</span>
              <span className={`badge ${
                circuitState === 'CLOSED' ? 'badge-status-green' : 
                circuitState === 'OPEN' ? 'badge-status-rose' : 'badge-status-orange'
              }`}>
                <span className="pulse-dot"></span>
                <span className="mono">{circuitState}</span>
              </span>
              {circuitState !== 'CLOSED' && (
                <button onClick={resetCircuit} className="btn btn-ghost btn-sm" title="Reset Circuit" style={{ padding: '0.2rem 0.5rem' }}>
                  <RefreshCw size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Scenario Selector Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--bg-tertiary)',
            overflowX: 'auto'
          }}>
            {SCENARIOS.map(sc => (
              <button
                key={sc.id}
                onClick={() => handleScenarioChange(sc)}
                style={{
                  padding: '0.75rem 1.25rem',
                  border: 'none',
                  background: selectedScenario.id === sc.id ? 'var(--bg-surface)' : 'transparent',
                  color: selectedScenario.id === sc.id ? 'var(--accent-primary)' : 'var(--text-secondary)',
                  fontWeight: selectedScenario.id === sc.id ? 700 : 500,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  borderBottom: selectedScenario.id === sc.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease'
                }}
              >
                {sc.name}
              </button>
            ))}
          </div>

          {/* Body: Controls vs Output */}
          <div className="simulator-body">
            
            {/* Left Column: Chaos & Defense Controls */}
            <div className="simulator-controls">
              <div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={18} color="var(--accent-primary)" />
                  <span>Upstream Chaos Generator</span>
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-tertiary)' }}>
                  Simulate external API instability & degradation.
                </p>
              </div>

              {/* Slider 1: Failure Rate */}
              <div className="slider-group">
                <div className="slider-header">
                  <span>Upstream 5xx / 429 Failure Rate</span>
                  <span className="mono" style={{ color: failureRate > 50 ? 'var(--accent-rose)' : 'var(--text-primary)', fontWeight: 600 }}>
                    {failureRate}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={failureRate}
                  onChange={(e) => setFailureRate(Number(e.target.value))}
                  className="custom-range"
                />
              </div>

              {/* Slider 2: Latency */}
              <div className="slider-group">
                <div className="slider-header">
                  <span>Upstream Raw Latency</span>
                  <span className="mono" style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                    {upstreamLatency}ms
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="2000"
                  step="50"
                  value={upstreamLatency}
                  onChange={(e) => setUpstreamLatency(Number(e.target.value))}
                  className="custom-range"
                />
              </div>

              <div style={{ height: '1px', background: 'var(--border-subtle)', margin: '0.25rem 0' }}></div>

              {/* Defense Toggles */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Syntropy Edge Defenses
                </div>

                <label className="switch-label">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Lock size={16} color="var(--accent-emerald)" />
                    <span style={{ fontSize: '0.875rem' }}>Autonomous Circuit Breaker</span>
                  </div>
                  <input
                    type="checkbox"
                    className="switch-input"
                    checked={circuitBreakerEnabled}
                    onChange={(e) => setCircuitBreakerEnabled(e.target.checked)}
                  />
                  <div className="switch-toggle"></div>
                </label>

                <label className="switch-label">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Database size={16} color="var(--accent-primary)" />
                    <span style={{ fontSize: '0.875rem' }}>Stale-While-Revalidate Fallback</span>
                  </div>
                  <input
                    type="checkbox"
                    className="switch-input"
                    checked={staleFallbackEnabled}
                    onChange={(e) => setStaleFallbackEnabled(e.target.checked)}
                  />
                  <div className="switch-toggle"></div>
                </label>

                <label className="switch-label">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={16} color="var(--accent-cyan)" />
                    <span style={{ fontSize: '0.875rem' }}>Schema Drift Sentry (Auto-Heal)</span>
                  </div>
                  <input
                    type="checkbox"
                    className="switch-input"
                    checked={schemaSentryEnabled}
                    onChange={(e) => setSchemaSentryEnabled(e.target.checked)}
                  />
                  <div className="switch-toggle"></div>
                </label>

                <label className="switch-label" style={{ opacity: 0.9 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>🧪 Induce Breaking Schema Drift</span>
                  </div>
                  <input
                    type="checkbox"
                    className="switch-input"
                    checked={simulateSchemaDrift}
                    onChange={(e) => setSimulateSchemaDrift(e.target.checked)}
                  />
                  <div className="switch-toggle"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto', paddingTop: '0.75rem' }}>
                <button
                  onClick={runSimulationRequest}
                  disabled={isProcessing}
                  className="btn btn-primary"
                  style={{ flex: 1, padding: '0.75rem', fontSize: '0.875rem' }}
                >
                  <Play size={16} />
                  <span>{isProcessing ? 'Routing...' : 'Send Request'}</span>
                </button>

                <button
                  onClick={runBurstTest}
                  disabled={isProcessing}
                  className="btn btn-secondary"
                  style={{ padding: '0.75rem', fontSize: '0.875rem' }}
                  title="Fire burst of 5 rapid requests"
                >
                  <ZapIcon size={16} />
                  <span>Burst (5x)</span>
                </button>
              </div>
            </div>

            {/* Right Column: Live Telemetry & Inspector */}
            <div className="simulator-telemetry">
              
              {/* Telemetry Status Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '0.5rem',
                padding: '0.85rem 1rem',
                borderRadius: '10px',
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {lastResult.status === 200 ? (
                    <CheckCircle2 size={18} color="var(--accent-emerald)" />
                  ) : (
                    <AlertTriangle size={18} color="var(--accent-rose)" />
                  )}
                  <span className="mono" style={{
                    fontWeight: 700,
                    fontSize: '0.9375rem',
                    color: lastResult.status === 200 ? 'var(--accent-emerald)' : 'var(--accent-rose)'
                  }}>
                    {lastResult.status} {lastResult.status === 200 ? 'OK' : 'ERROR'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                    Client Latency: <strong className="mono" style={{ color: 'var(--text-primary)' }}>{lastResult.durationMs.toFixed(1)}ms</strong>
                  </div>
                  <span className={`badge ${
                    lastResult.origin === 'UPSTREAM_FRESH' ? 'badge-status-green' :
                    lastResult.origin === 'EDGE_FALLBACK' ? 'badge-status-orange' :
                    lastResult.origin === 'SCHEMA_HEALED' ? 'badge-status-green' : 'badge-status-rose'
                  }`} style={{ fontSize: '0.75rem' }}>
                    {lastResult.origin}
                  </span>
                </div>
              </div>

              {/* Latency Breakdown Visualizer (Flamegraph) */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.35rem', color: 'var(--text-tertiary)' }}>
                  <span>Latency Breakdown</span>
                  <span className="mono">Total: {lastResult.durationMs.toFixed(1)}ms</span>
                </div>
                <div className="flamegraph">
                  <div className="flame-segment" style={{ width: '15%', background: '#0284c7' }} title="DNS & TLS Handshake (1.2ms)">
                    TLS 1.2ms
                  </div>
                  <div className="flame-segment" style={{ width: '20%', background: '#6366f1' }} title="Syntropy Edge Isolation (1.6ms)">
                    Edge 1.6ms
                  </div>
                  <div 
                    className="flame-segment" 
                    style={{ 
                      width: '65%', 
                      background: lastResult.origin === 'EDGE_FALLBACK' ? '#ea580c' : lastResult.status === 200 ? '#10b981' : '#e11d48' 
                    }}
                    title={lastResult.origin === 'EDGE_FALLBACK' ? 'Instant Fallback Cache (1.4ms)' : `Upstream Fetch (${(lastResult.durationMs * 0.65).toFixed(0)}ms)`}
                  >
                    {lastResult.origin === 'EDGE_FALLBACK' ? '⚡ Stale Cache Hit' : lastResult.status === 200 ? 'Upstream 200' : '5xx Timeout'}
                  </div>
                </div>
              </div>

              {/* Payload JSON Inspector */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '180px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Client Response Payload</span>
                  <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>application/json</span>
                </div>
                <div className="code-block" style={{ flex: 1, maxHeight: '200px', fontSize: '0.8125rem' }}>
                  <pre style={{ margin: 0 }}>
                    {JSON.stringify(lastResult.payload, null, 2)}
                  </pre>
                </div>
              </div>

              {/* Mini Event Log */}
              <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Gateway Live Telemetry Stream
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: '75px', overflowY: 'auto' }}>
                  {logs.slice(0, 3).map(log => (
                    <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      <span className="mono" style={{ color: 'var(--text-tertiary)' }}>[{log.time}]</span>
                      <span style={{
                        color: log.type === 'error' ? 'var(--accent-rose)' :
                               log.type === 'warn' ? 'var(--accent-primary)' :
                               log.type === 'success' ? 'var(--accent-emerald)' : 'var(--text-secondary)'
                      }}>
                        {log.msg}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

function ZapIcon(props: { size?: number }) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}
