
import axios from 'axios';
import { CONFIG } from '../config.js';
import { FOODS, CATEGORIES } from '../data/foods.js';

// Configuration
const MOCK = !CONFIG.apiUrl;
const STEP_MS = 25000;

export const STEPS = [
  'Confirmed',
  'Preparing',
  'On the way',
  'Delivered',
];

const base = CONFIG.apiUrl.replace(/\/$/, '');

const http = axios.create({
  baseURL: base,
  timeout: 15000,
});

// Token management
const T = {
  a: () => localStorage.getItem('fs:token'),
  r: () => localStorage.getItem('fs:refresh'),

  set: (a, r) => {
    localStorage.setItem('fs:token', a);
    if (r) localStorage.setItem('fs:refresh', r);
  },

  clear: () => {
    localStorage.removeItem('fs:token');
    localStorage.removeItem('fs:refresh');
  },
};

const signedOut = () => {
  T.clear();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('fs:logout'));
  }
};

// Request interceptor
http.interceptors.request.use((c) => {
  const t = T.a();

  if (t) {
    c.headers.Authorization = `Bearer ${t}`;
  }

  return c;
});

// Response interceptor
let refreshing = null;

http.interceptors.response.use(
  (r) => r,

  async (err) => {
    const cfg = err.config || {};
    const isAuthUrl = (cfg.url || '').includes('/api/auth/');

    if (err.response?.status === 401 && !isAuthUrl && T.a()) {
      if (T.r() && !cfg._retry) {
        cfg._retry = true;

        try {
          refreshing =
            refreshing ||
            axios
              .post(`${base}/api/auth/refresh/`, {
                refresh: T.r(),
              })
              .finally(() => {
                refreshing = null;
              });

          const { data } = await refreshing;

          T.set(data.access, data.refresh);

          return http(cfg);
        } catch {
          signedOut();
        }
      } else {
        signedOut();
      }
    }

    return Promise.reject(err);
  }
);

// Helpers
const wait = (ms) =>
  new Promise((r) => setTimeout(r, ms));

const ls = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
};

const norm = (o) => {
  if (o.status === 'Cancelled' || o.cancelledAt) {
    return {
      ...o,
      status: 'Cancelled',
      statusIndex: -1,
      cancellable: false,
    };
  }

  const i = MOCK
    ? Math.min(
        3,
        Math.floor((Date.now() - o.createdAt) / STEP_MS)
      )
    : Math.max(0, STEPS.indexOf(o.status));

  return {
    ...o,
    statusIndex: i,
    status: STEPS[i],
    cancellable: MOCK ? i === 0 : !!o.cancellable,
  };
};

const fail = (m) => {
  throw new Error(m);
};

const msg = (e) => {
  const d = e.response?.data;

  if (!d) {
    return e.code === 'ERR_NETWORK'
      ? 'Cannot reach the server. Is the backend running?'
      : e.message || 'Something went wrong.';
  }

  if (typeof d === 'string') {
    return 'Server error. Please try again.';
  }

  if (d.detail) return d.detail;

  const v = Object.values(d)[0];

  return String(
    Array.isArray(v)
      ? v[0]
      : typeof v === 'object'
        ? Object.values(v)[0]
        : v
  );
};

// Categories
export async function getCategories() {
  if (MOCK) return CATEGORIES;

  try {
    return (await http.get('/api/categories/')).data;
  } catch (e) {
    fail(msg(e));
  }
}

// Foods
export async function getFoods() {
  if (MOCK) {
    await wait(150);
    return FOODS;
  }

  try {
    return (await http.get('/api/products/')).data;
  } catch (e) {
    fail(msg(e));
  }
}

// Signup
export async function signup({
  name,
  email,
  password,
  phone,
}) {
  if (MOCK) {
    await wait(300);

    const u = ls('fs:users', {});

    // Demo authentication only
    u[email] = {
      ...u[email],
      name,
      email,
      phone,
    };

    localStorage.setItem('fs:users', JSON.stringify(u));
    localStorage.setItem('fs:token', 'mock');

    return u[email];
  }

  try {
    const { data } = await http.post(
      '/api/auth/register/',
      { name, email, password, phone }
    );

    T.set(data.access, data.refresh);

    return data.user;
  } catch (e) {
    fail(msg(e));
  }
}

// Login
export async function login({ email, password }) {
  if (MOCK) {
    await wait(300);

    const users = ls('fs:users', {});
    let u = users[email];

    if (!u) {
      u = {
        name: email
          .split('@')[0]
          .replace(/[._-]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        email,
      };

      users[email] = u;

      localStorage.setItem(
        'fs:users',
        JSON.stringify(users)
      );
    }

    localStorage.setItem('fs:token', 'mock');

    return u;
  }

  try {
    const { data } = await http.post(
      '/api/auth/login/',
      { email, password }
    );

    T.set(data.access, data.refresh);

    return data.user;
  } catch (e) {
    fail(msg(e));
  }
}

// Logout
export const logout = () => T.clear();

// Place order
export async function placeOrder(p) {
  if (MOCK) {
    await wait(500);

    const o = {
      ...p,
      id:
        'FS-' +
        Math.random()
          .toString(36)
          .slice(2, 8)
          .toUpperCase(),
      createdAt: Date.now(),
    };

    localStorage.setItem(
      'fs:orders',
      JSON.stringify([o, ...ls('fs:orders', [])])
    );

    return norm(o);
  }

  try {
    const body = {
      name: p.name,
      phone: p.phone,
      address: p.address,
      latitude: p.coords?.[0] ?? null,
      longitude: p.coords?.[1] ?? null,
      notes: p.notes || '',
      payment_method: p.paymentMethod,
      promo_code: p.promo || '',
      items: p.items.map((i) => ({
        product_id: i.id,
        quantity: i.qty,
      })),
    };

    return norm(
      (await http.post('/api/orders/', body)).data
    );
  } catch (e) {
    fail(msg(e));
  }
}

// Get orders
export async function getOrders(email) {
  if (MOCK) {
    await wait(150);

    return ls('fs:orders', [])
      .filter((o) => o.email === email)
      .map(norm);
  }

  try {
    return (await http.get('/api/orders/')).data.map(norm);
  } catch (e) {
    fail(msg(e));
  }
}

// Get single order
export async function getOrder(id) {
  if (MOCK) {
    const o = ls('fs:orders', []).find(
      (o) => o.id === id
    );

    if (!o) fail('Order not found.');

    return norm(o);
  }

  try {
    return norm(
      (await http.get(`/api/orders/${id}/`)).data
    );
  } catch (e) {
    fail(msg(e));
  }
}

// Password reset
export async function forgotPassword(email) {
  if (MOCK) {
    await wait(300);

    return 'Demo mode: no email is sent. Connect the backend to enable password reset.';
  }

  try {
    return (
      await http.post('/api/auth/password-reset/', {
        email,
      })
    ).data.detail;
  } catch (e) {
    fail(msg(e));
  }
}

// Reset password
export async function resetPassword({
  uid,
  token,
  password,
}) {
  if (MOCK) {
    fail('Demo mode: password reset needs the backend.');
  }

  try {
    return (
      await http.post(
        '/api/auth/password-reset/confirm/',
        { uid, token, password }
      )
    ).data.detail;
  } catch (e) {
    fail(msg(e));
  }
}

// Email verification
export async function verifyEmail({ uid, token }) {
  if (MOCK) {
    fail('Demo mode: email verification needs the backend.');
  }

  try {
    return (
      await http.post('/api/auth/verify-email/', {
        uid,
        token,
      })
    ).data;
  } catch (e) {
    fail(msg(e));
  }
}

// Resend verification
export async function resendVerification() {
  if (MOCK) {
    await wait(200);

    return 'Demo mode: no email is sent.';
  }

  try {
    return (
      await http.post('/api/auth/resend-verification/')
    ).data.detail;
  } catch (e) {
    fail(msg(e));
  }
}

// Current user
export async function getMe() {
  if (MOCK) return null;

  try {
    return (await http.get('/api/auth/me/')).data;
  } catch (e) {
    fail(msg(e));
  }
}

// Cancel order
export async function cancelOrder(id) {
  if (MOCK) {
    await wait(200);

    const all = ls('fs:orders', []);
    const o = all.find((x) => x.id === id);

    if (!o) fail('Order not found.');

    if (
      Math.floor((Date.now() - o.createdAt) / STEP_MS) >= 1
    ) {
      fail(
        'This order can no longer be cancelled because the kitchen has started preparing it.'
      );
    }

    o.cancelledAt = Date.now();

    localStorage.setItem(
      'fs:orders',
      JSON.stringify(all)
    );

    return norm(o);
  }

  try {
    return norm(
      (await http.post(`/api/orders/${id}/cancel/`)).data
    );
  } catch (e) {
    fail(msg(e));
  }
}

// Change payment
export async function changePayment(id, method) {
  if (MOCK) {
    fail('Demo mode: payments are simulated.');
  }

  try {
    return norm(
      (
        await http.post(`/api/orders/${id}/payment/`, {
          method,
        })
      ).data
    );
  } catch (e) {
    fail(msg(e));
  }
}
