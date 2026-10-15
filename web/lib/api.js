/**
 * api.js - typed-by-contract client for the FastAPI recovery service.
 *
 * Every function maps 1:1 to a route in contracts/README.md and returns the
 * JSON shape defined in contracts/schemas/rest-api.schema.json.
 * With NEXT_PUBLIC_USE_MOCKS=true the same functions are served by
 * lib/mockApi.js so the UI can be built and demoed without any backend.
 */
import { mockApi } from './mockApi';
// NEXT_PUBLIC_USE_MOCKS=false => classic build: every call (sign-in included) goes to the FastAPI backend
//                                at NEXT_PUBLIC_API_BASE ('' = same origin, proxied by next.config.js).
// anything else (hosted site)    => hybrid: sign-in on the website, recovery calls go to the Recovery Agent on
//                                the visitor's PC once it is detected, and to the built-in demo data until then.
const STATIC_REAL = process.env.NEXT_PUBLIC_USE_MOCKS === 'false';
// '' => same origin, proxied by next.config.js (local `npm start`).
// 'http://127.0.0.1:8000' => hosted build (Firebase): the browser talks to the Recovery Agent
// (FastAPI backend + engine) running on the visitor's own PC, so scans and restores use their disks.
const BASE = (process.env.NEXT_PUBLIC_API_BASE || '').replace(/\/+$/, '');
const TOKEN_KEY = 'frs_token';
const USER_KEY = 'frs_user';

export class ApiError extends Error {
  constructor(status, detail, code) {
    const message = typeof detail === 'string' ? detail : (detail && (detail.message || detail.detail)) || `HTTP ${status}`;
    super(message);
    this.status = status;
    this.detail = detail;
    this.code = code;
  }
}

// ----------------------------------------------------------------------------- session storage
export const session = {
  token() {
    if (typeof window === 'undefined') return null;
    try { return window.localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  user() {
    if (typeof window === 'undefined') return null;
    try { return JSON.parse(window.localStorage.getItem(USER_KEY) || 'null'); } catch { return null; }
  },
  save(auth) {
    try {
      window.localStorage.setItem(TOKEN_KEY, auth.access_token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(auth.user));
    } catch { /* storage disabled: session lasts for this tab only */ }
  },
  clear() {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
      window.localStorage.removeItem(USER_KEY);
    } catch { /* ignore */ }
  },
};

let unauthorizedHandler = null;
export function onUnauthorized(fn) { unauthorizedHandler = fn; }

// ----------------------------------------------------------------------------- Recovery Agent connection
// Hybrid mode (default, used by the hosted site): sign-in stays on the website; drives, scans, restores
// and reports go to the Recovery Agent on this PC as soon as one is detected, otherwise to the mock demo.
const AGENT_URL_KEY = 'frs_agent_url';
const AGENT_TOKEN_KEY = 'frs_agent_token';
export const DEFAULT_AGENT_URL = 'http://127.0.0.1:8000';
const normalizeUrl = (u) => String(u || '').trim().replace(/\/+$/, '');

let agent = { url: null, token: null };
const modeListeners = new Set();
function emitMode() { modeListeners.forEach((fn) => { try { fn(); } catch { /* ignore */ } }); }
export function subscribeApiMode(fn) { modeListeners.add(fn); return () => modeListeners.delete(fn); }
/** 'mock' | 'agent' | 'backend' */
export function getApiMode() { return STATIC_REAL ? 'backend' : agent.token ? 'agent' : 'mock'; }
export function isMockMode() { return getApiMode() === 'mock'; }
export function getAgentUrl() {
  if (agent.url) return agent.url;
  if (typeof window !== 'undefined') {
    try { const saved = window.localStorage.getItem(AGENT_URL_KEY); if (saved) return normalizeUrl(saved); } catch { /* ignore */ }
  }
  return BASE && /^https?:\/\//i.test(BASE) ? BASE : DEFAULT_AGENT_URL;
}

/** Health probe without auth. Resolves to the health JSON or throws. */
export async function probeAgent(url = getAgentUrl()) {
  const res = await fetch(`${normalizeUrl(url)}/api/health`, { cache: 'no-store', headers: { Accept: 'application/json' } });
  if (!res.ok) throw new ApiError(res.status, res.statusText);
  return res.json();
}

/** Gets a local session from the agent and switches every recovery call to it. */
export async function connectAgent(url = getAgentUrl()) {
  const base = normalizeUrl(url);
  let res;
  try {
    res = await fetch(`${base}/api/agent/session`, { method: 'POST', cache: 'no-store', headers: { Accept: 'application/json' } });
  } catch {
    throw new ApiError(0, `Cannot reach the Recovery Agent at ${base}.`, 'NETWORK');
  }
  if (res.status === 404 || res.status === 405) {
    throw new ApiError(res.status, 'This Recovery Agent is an older version. Download recovery-agent.zip again and restart it.', 'AGENT_OUTDATED');
  }
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch { /* ignore */ }
    throw new ApiError(res.status, detail, 'AGENT_SESSION');
  }
  const auth = await res.json();
  const changed = agent.token === null || agent.url !== base;
  agent = { url: base, token: auth.access_token };
  try {
    window.localStorage.setItem(AGENT_URL_KEY, base);
    window.localStorage.setItem(AGENT_TOKEN_KEY, auth.access_token);
  } catch { /* storage disabled */ }
  if (changed) emitMode();
  return { url: base, user: auth.user };
}

export function disconnectAgent() {
  if (!agent.token) return;
  agent = { url: agent.url, token: null };
  try { window.localStorage.removeItem(AGENT_TOKEN_KEY); } catch { /* ignore */ }
  emitMode();
}

// ----------------------------------------------------------------------------- transport
async function request(method, path, { body, query, form, raw } = {}, ctx = null) {
  const base = ctx ? ctx.base : BASE;
  const url = new URL(base + path, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
  if (query) {
    Object.entries(query).forEach(([k, v]) => {
      if (v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0)) return;
      url.searchParams.set(k, Array.isArray(v) ? v.join(',') : String(v));
    });
  }
  const headers = {};
  const token = ctx ? ctx.token : session.token();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(url.toString(), { method, headers, body: payload, cache: 'no-store' });
  } catch (e) {
    throw new ApiError(0, ctx || usesLocalAgent
      ? 'Cannot reach the Recovery Agent on this computer. Start it (double-click start-agent.bat) - see the Agent setup page.'
      : 'Cannot reach the recovery service. Is the backend running on port 8000?', 'NETWORK');
  }
  if (!ctx && res.status === 401 && unauthorizedHandler && !path.startsWith('/api/auth/login')) unauthorizedHandler();
  if (!res.ok) {
    let detail = res.statusText;
    let code;
    try {
      const j = await res.json();
      detail = j.detail ?? detail;
      code = j.code;
    } catch { /* non-JSON error body */ }
    throw new ApiError(res.status, detail, code);
  }
  if (raw) return res;
  if (res.status === 204) return null;
  return res.json();
}

/** Calls the connected agent; renews the agent session once if it expired (e.g. agent restarted). */
async function agentRequest(method, path, opts) {
  try {
    return await request(method, path, opts, { base: agent.url, token: agent.token });
  } catch (e) {
    if (e.status !== 401) throw e;
    await connectAgent(agent.url);
    return request(method, path, opts, { base: agent.url, token: agent.token });
  }
}

const enc = encodeURIComponent;

function makeApi(request) {
  return {
    // ---- auth (Module 1 with 2FA)
    register: (email, password, fullName, phoneNumber) =>
      request('POST', '/api/auth/register', { body: { email, password, full_name: fullName || null, phone_number: phoneNumber || null } }),
    login: (email, password, phoneNumber) =>
      request('POST', '/api/auth/login', { body: { email, password, phone_number: phoneNumber || null } }),
    verify2FA: (verificationId, code) => request('POST', '/api/auth/verify-2fa', { body: { verification_id: verificationId, code } }),
    resend2FA: (verificationId, phoneNumber) =>
      request('POST', '/api/auth/resend-2fa', { body: { verification_id: verificationId, phone_number: phoneNumber || null } }),
    logout: () => request('POST', '/api/auth/logout'),
    me: () => request('GET', '/api/auth/me'),
    // ---- system
    health: () => request('GET', '/api/health'),
    systemStatus: () => request('GET', '/api/system/status'),
    drives: (refresh = false) => request('GET', '/api/drives', { query: { refresh: refresh || undefined } }),
    validateDestination: (destination, sources, requiredBytes = 0) =>
      request('POST', '/api/destinations/validate', { body: { destination, sources, required_bytes: requiredBytes } }),
    // ---- scans
    createScan: (req) => request('POST', '/api/scans', { body: req }),
    importScan: (file, label) => {
      const fd = new FormData();
      fd.append('file', file);
      return request('POST', '/api/scans/import', { form: fd, query: { label } });
    },
    listScans: (params = {}) => request('GET', '/api/scans', { query: params }),
    getScan: (id) => request('GET', `/api/scans/${enc(id)}`),
    getProgress: (id) => request('GET', `/api/scans/${enc(id)}/progress`),
    cancelScan: (id) => request('POST', `/api/scans/${enc(id)}/cancel`),
    deleteScan: (id) => request('DELETE', `/api/scans/${enc(id)}`),
    // ---- results (Module 6)
    listFiles: (id, params = {}) => request('GET', `/api/scans/${enc(id)}/files`, { query: params }),
    getFile: (id, fid) => request('GET', `/api/scans/${enc(id)}/files/${enc(fid)}`),
    getPreview: (id, fid) => request('GET', `/api/scans/${enc(id)}/files/${enc(fid)}/preview`),
    clusters: (id) => request('GET', `/api/scans/${enc(id)}/clusters`),
    stats: (id) => request('GET', `/api/scans/${enc(id)}/stats`),
    search: (q, limit = 50) => request('GET', '/api/search', { query: { q, limit } }),
    // ---- restore
    restore: (id, req) => request('POST', `/api/scans/${enc(id)}/restore`, { body: req }),
    getRestore: (jobId) => request('GET', `/api/restores/${enc(jobId)}`),
    cancelRestore: (jobId) => request('POST', `/api/restores/${enc(jobId)}/cancel`),
    listRestores: (id) => request('GET', `/api/scans/${enc(id)}/restores`),
    // ---- reports (Module 7)
    createReport: (id, title) => request('POST', `/api/scans/${enc(id)}/reports`, { body: title ? { title } : {} }),
    listReports: (scanId) => request('GET', '/api/reports', { query: { scan_id: scanId } }),
    // ---- binary helpers (auth header => blob => object URL)
    fetchBlobUrl: async (path) => {
      const res = await request('GET', path, { raw: true });
      return URL.createObjectURL(await res.blob());
    },
    downloadFile: async (path, fileName) => {
      const res = await request('GET', path, { raw: true });
      const url = URL.createObjectURL(await res.blob());
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName || 'download';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    },
  };
}

const backendApi = makeApi((m, p, o) => request(m, p, o));
const agentApi = makeApi(agentRequest);
// Website sign-in (Twilio OTP + demo accounts) never goes to the agent.
const WEBSITE_METHODS = new Set(['register', 'login', 'verify2FA', 'resend2FA', 'logout', 'me']);

export const api = STATIC_REAL
  ? backendApi
  : new Proxy({}, {
    get(_, prop) {
      if (typeof prop !== 'string') return undefined;
      if (WEBSITE_METHODS.has(prop)) return mockApi[prop];
      return (agent.token ? agentApi : mockApi)[prop];
    },
  });
/** @deprecated mode is decided at runtime now - use getApiMode()/useApiMode(). True when no live backend is in use yet. */
export const usingMocks = !STATIC_REAL;
/** True when the site talks to a Recovery Agent on the visitor's PC (hosted build). */
export const usesLocalAgent = !STATIC_REAL;
export const agentAddress = BASE;
