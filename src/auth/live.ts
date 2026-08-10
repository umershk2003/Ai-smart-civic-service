// Real-time event stream (SSE) client. EventSource can't set headers, so the
// JWT is passed as a query parameter. The stream auto-(re)connects when a token
// appears and reconnects with backoff on drops (e.g. server restarts).

import { getAuthToken } from './api';

export interface LiveEvent {
  type: string;
  [key: string]: unknown;
}

/** Server-persisted notification (backend/app/routers/live.py). */
export interface ServerNotification {
  id: string;
  roles: string[];
  title: string;
  description: string;
  tone?: 'critical' | 'info' | 'success';
  tab?: string;
  action?: string;
  ticketId?: string;
  createdAt: string;
  read: boolean;
}

const RECONNECT_DELAY_MS = 2500;
const MAX_RECONNECT_DELAY_MS = 15000;

type Handler = (event: LiveEvent) => void;

class LiveStream {
  private es: EventSource | null = null;
  private connectedToken: string | null = null;
  private handlers = new Set<Handler>();
  private retryMs = RECONNECT_DELAY_MS;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;

  /** Subscribe; returns an unsubscribe function. */
  subscribe(handler: Handler): () => void {
    this.handlers.add(handler);
    this.ensureConnected();
    return () => {
      this.handlers.delete(handler);
    };
  }

  /** Call when the auth token changes (login/logout/role switch). */
  refresh() {
    const token = getAuthToken();
    if (token !== this.connectedToken) {
      this.close();
      this.ensureConnected();
    }
  }

  private ensureConnected() {
    const token = getAuthToken();
    if (!token || this.es || this.retryTimer) return;
    this.connectedToken = token;
    this.es = new EventSource(`/api/events/stream?token=${encodeURIComponent(token)}`);
    this.es.onopen = () => {
      this.retryMs = RECONNECT_DELAY_MS;
    };
    this.es.onmessage = (ev) => {
      try {
        const event = JSON.parse(ev.data) as LiveEvent;
        this.handlers.forEach((h) => h(event));
      } catch {
        /* ignore malformed frames */
      }
    };
    this.es.onerror = () => {
      this.close();
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect() {
    if (this.retryTimer || !getAuthToken()) return;
    this.retryTimer = setTimeout(() => {
      this.retryTimer = null;
      this.ensureConnected();
    }, this.retryMs);
    this.retryMs = Math.min(this.retryMs * 2, MAX_RECONNECT_DELAY_MS);
  }

  private close() {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }
    if (this.es) {
      this.es.close();
      this.es = null;
    }
    this.connectedToken = null;
  }
}

// Reconnect when the auth token changes (login, logout, persona switch). The
// token is minted asynchronously, so this event arrives after the user state
// update that would otherwise trigger a stale-stream refresh.
if (typeof window !== 'undefined') {
  window.addEventListener('civic:auth-token', () => liveStream.refresh());
}

export const liveStream = new LiveStream();
