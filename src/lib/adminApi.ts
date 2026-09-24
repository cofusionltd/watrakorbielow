/**
 * Admin API Helper for Watra Korbielów
 * Automatically attaches Bearer tokens to administrative requests
 */

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem('watra_admin_token');
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    localStorage.setItem('watra_admin_token', token);
  } catch {}
}

export function clearAdminToken(): void {
  try {
    localStorage.removeItem('watra_admin_token');
  } catch {}
}

export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init?.headers || {});
  
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(input, {
    ...init,
    headers
  });

  // If token expired or forbidden, notify or clear
  if (response.status === 401 || response.status === 403) {
    if (window.location.hash.includes('admin')) {
      console.warn('Admin session token rejected by server.');
    }
  }

  return response;
}
