import { API_BASE_URL } from './api';

// Base URL for AI endpoints uses the exact same API_BASE_URL configured for the whole app
export const BASE_URL = API_BASE_URL;
const STORAGE_KEY = 'freshai_session_key';

export function getSessionKey() {
  try {
    return localStorage.getItem(STORAGE_KEY) || localStorage.getItem('token');
  } catch (err) {
    return null;
  }
}

export function setSessionKey(key) {
  try {
    localStorage.setItem(STORAGE_KEY, key);
  } catch (err) {
    // ignore
  }
}

export function clearSessionKey() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    // ignore
  }
}

export async function login(username, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    // If external engine login fails, try main auth login
    const authRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password }),
    }).catch(() => null);

    if (authRes && authRes.ok) {
      const authData = await authRes.json();
      const token = authData?.accessToken || authData?.token;
      if (token) {
        setSessionKey(token);
        return token;
      }
    }

    const text = await res.text();
    throw new Error(text || `Login failed (${res.status})`);
  }

  const data = await res.json();
  const key = data?.sessionKey || data?.session_key || data?.token || data?.accessToken;
  if (!key) throw new Error('No sessionKey received from server');
  setSessionKey(key);
  return key;
}

export async function sendMessageToAI(message) {
  const key = getSessionKey();
  const headers = {
    'Content-Type': 'application/json',
  };
  if (key) {
    headers['Authorization'] = `Bearer ${key}`;
  }

  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Chat request failed (${res.status})`);
  }

  const data = await res.json();
  return data?.reply || data?.response || data?.message || '';
}

export async function getRecommendations(userId) {
  const q = `userId=${encodeURIComponent(String(userId))}`;
  const key = getSessionKey();
  const headers = { 'Content-Type': 'application/json' };
  if (key) {
    headers['Authorization'] = `Bearer ${key}`;
  }

  const res = await fetch(`${BASE_URL}/recommendations?${q}`, {
    method: 'GET',
    headers,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Recommendations request failed (${res.status})`);
  }

  return (await res.json()) || [];
}

