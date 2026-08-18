import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeSnippet {
  lang: string;
  name: string;
  filename: string;
  code: string;
}

const SNIPPETS: CodeSnippet[] = [
  {
    lang: 'typescript',
    name: 'TypeScript / Next.js',
    filename: 'lib/syntropy-client.ts',
    code: `import { createSyntropyClient } from '@syntropy/sdk';

export const gateway = createSyntropyClient({
  apiKey: process.env.SYNTROPY_API_KEY!,
  endpoint: 'https://api.gateway.syntropy.io',
  circuitBreaker: { threshold: 3, timeoutMs: 8000 }
});

// Drop-in wrapper around standard fetch:
export async function getJobsFeed() {
  const { data, meta } = await gateway.fetch('/v1/feeds/jobs', {
    cacheStrategy: 'stale-while-revalidate',
    fallbackTTL: 3600 // Return cached snapshot if upstream 5xx
  });

  console.log('Served from:', meta.origin); // 'edge-cache' or 'upstream-live'
  return data;
}`
  },
  {
    lang: 'python',
    name: 'Python (FastAPI)',
    filename: 'services/resilient_ingest.py',
    code: `from syntropy import SyntropyEdgeClient

client = SyntropyEdgeClient(
    api_key="syn_live_9482910482",
    circuit_breaker_enabled=True,
    jitter_range_ms=(150, 600)
)

async def fetch_resilient_feed():
    response = await client.get(
        "https://api.external-job-board.com/feed",
        stale_fallback=True,
        timeout_seconds=4.0
    )
    # Guaranteed 200 OK even if upstream is having an outage:
    return response.json()`
  },
  {
    lang: 'go',
    name: 'Go',
    filename: 'gateway/ingest.go',
    code: `package main

import (
	"context"
	"github.com/syntropy-io/syntropy-go"
)

func main() {
	client := syntropy.NewClient(&syntropy.Config{
		APIKey: "syn_live_9482910482",
		AutoCircuitBreak: true,
	})

	resp, err := client.Fetch(context.Background(), "/v1/payments/verify", syntropy.Options{
		StaleFallbackTTL: 1800,
	})
	if err != nil {
		panic(err)
	}
	_ = resp
}`
  },
  {
    lang: 'curl',
    name: 'cURL / Shell',
    filename: 'terminal.sh',
    code: `curl -X GET "https://api.gateway.syntropy.io/v1/feeds/jobs" \\
  -H "Authorization: Bearer syn_live_9482910482" \\
  -H "X-Syntropy-Circuit-Breaker: auto" \\
  -H "X-Syntropy-Fallback: stale-while-revalidate" \\
  -H "X-Syntropy-Timeout-Ms: 1500" -i`
  }
];

export const CodeMatrix: React.FC = () => {
  const [activeLang, setActiveLang] = useState<string>('typescript');
  const [copied, setCopied] = useState<boolean>(false);

  const currentSnippet = SNIPPETS.find(s => s.lang === activeLang) || SNIPPETS[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentSnippet.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="sdks" className="section">
      <div className="container">
        
        <div className="section-header">
          <div className="badge badge-status-orange" style={{ marginBottom: '0.75rem' }}>
            <span>Zero Lock-in Integration</span>
          </div>
          <h2>Drop Into Your Stack in 3 Lines of Code</h2>
          <p>
            Whether you use Next.js, Node, Python, Go, or raw HTTP proxies, Syntropy drops directly into your existing network layer.
          </p>
        </div>

        <div className="card" style={{ maxWidth: '900px', margin: '0 auto', overflow: 'hidden' }}>
          
          {/* Language Selector Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0.5rem 1rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto' }}>
              {SNIPPETS.map(snippet => (
                <button
                  key={snippet.lang}
                  onClick={() => setActiveLang(snippet.lang)}
                  style={{
                    background: activeLang === snippet.lang ? 'var(--bg-surface)' : 'transparent',
                    color: activeLang === snippet.lang ? 'var(--text-primary)' : 'var(--text-secondary)',
                    border: '1px solid',
                    borderColor: activeLang === snippet.lang ? 'var(--border-default)' : 'transparent',
                    borderRadius: '6px',
                    padding: '0.4rem 0.85rem',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {snippet.name}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                <Terminal size={14} />
                <span className="mono">{currentSnippet.filename}</span>
              </div>
              <button
                onClick={handleCopy}
                className="btn btn-secondary btn-sm"
                style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
              >
                {copied ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="code-block" style={{ margin: 0, borderRadius: 0, border: 'none', minHeight: '280px', fontSize: '0.85rem' }}>
            <pre style={{ margin: 0 }}>
              {currentSnippet.code}
            </pre>
          </div>

        </div>

      </div>
    </section>
  );
};
