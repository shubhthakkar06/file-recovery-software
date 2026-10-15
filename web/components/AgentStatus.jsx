'use client';
/**
 * AgentStatus.jsx - detects the local Recovery Agent (FastAPI backend + engine on this PC).
 *
 * On the hosted site the website is only the user interface: every scan and restore runs in the agent
 * on the visitor's own computer, reached at http://127.0.0.1:8000. While no agent is detected the site
 * shows the built-in demo data; as soon as one answers, it signs in to it and switches to live data.
 */
import { Fragment, useEffect, useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { api, connectAgent, disconnectAgent, getAgentRevision, getApiMode, probeAgent, subscribeApiMode } from '@/lib/api';
import { Alert } from './ui';

/** 'mock' | 'agent' | 'backend' - re-renders when the site switches between demo and live data. */
export function useApiMode() {
  return useSyncExternalStore(subscribeApiMode, getApiMode, () => 'mock');
}

/** Remounts the page when the data source changes, so nothing keeps showing demo data after connecting. */
export function ApiModeBoundary({ children }) {
  const mode = useApiMode();
  return <Fragment key={mode}>{children}</Fragment>;
}

/** { state: 'checking' | 'connected' | 'missing', health, error } - re-checked every `intervalMs`. */
export function useAgentStatus(intervalMs = 4000) {
  const [status, setStatus] = useState({ state: 'checking', health: null, error: null });
  useEffect(() => {
    let alive = true;
    let timer = null;
    const check = async () => {
      const revision = getAgentRevision();
      try {
        if (getApiMode() === 'backend') {
          const health = await api.health();
          if (alive) setStatus({ state: 'connected', health, error: null });
        } else {
          const health = await probeAgent();
          if (getApiMode() !== 'agent') await connectAgent();
          if (alive) setStatus({ state: 'connected', health, error: null });
        }
      } catch (err) {
        // The setup page may have connected successfully while this older probe
        // was still in flight. Do not let its stale failure switch back to mocks.
        if (getAgentRevision() !== revision) {
          if (alive) timer = setTimeout(check, intervalMs);
          return;
        }
        if (getApiMode() === 'agent' && err && err.code !== 'AGENT_OUTDATED') disconnectAgent();
        if (alive) setStatus({ state: 'missing', health: null, error: err ? err.message : null });
      }
      if (alive) timer = setTimeout(check, intervalMs);
    };
    check();
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [intervalMs]);
  return status;
}

/** Shown under the navigation bar while the site is on demo data because no agent answered. */
export function AgentBanner() {
  const pathname = usePathname();
  const { state, error } = useAgentStatus(5000);
  if (state !== 'missing' || (pathname || '').startsWith('/agent') || (pathname || '').startsWith('/login')) return null;
  return (
    <div className="mx-auto max-w-7xl px-4 pt-4">
      <Alert tone="warning" title="Recovery Agent not detected - showing demo data">
        Scans and restores run in a small program on your own PC, so your disks never leave it.{' '}
        <Link href="/agent" className="font-semibold underline">Set up the Recovery Agent</Link>
        {' '}(about 5 minutes, once). The site switches to your real drives automatically once it is running.
        {error && error.includes('older version') ? <span className="block mt-1 font-semibold">{error}</span> : null}
      </Alert>
    </div>
  );
}
