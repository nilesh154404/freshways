// Simple FreshAI frontend service (modern async/await)
// Base URL for the AI engine
export const BASE_URL = 'http://localhost:8080/api';
const STORAGE_KEY = 'freshai_session_key';

export function getSessionKey() {
  try {
    return localStorage.getItem(STORAGE_KEY);
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
    const text = await res.text();
    throw new Error(text || `Login failed (${res.status})`);
  }

  const data = await res.json();
  const key = data?.sessionKey || data?.session_key || data?.token;
  if (!key) throw new Error('No sessionKey received from server');
  setSessionKey(key);
  return key;
}

export async function sendMessageToAI(message) {
  const key = getSessionKey();
  if (!key) throw new Error('Missing sessionKey. Please login first.');

  const res = await fetch(`${BASE_URL}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({ message }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Chat request failed (${res.status})`);
  }

  const data = await res.json();
  return data?.response || '';
}

export async function getRecommendations(userId) {
  const q = `userId=${encodeURIComponent(String(userId))}`;
  const res = await fetch(`${BASE_URL}/recommendations?${q}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Recommendations request failed (${res.status})`);
  }

  return (await res.json()) || [];
}
