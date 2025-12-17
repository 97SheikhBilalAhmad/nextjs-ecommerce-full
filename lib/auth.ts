export function saveToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token)
  }
}

export function getToken() {
  return typeof window !== 'undefined' ? localStorage.getItem('token') : null
}

export type CurrentUser = {
  id: string
  role: string
}

export function getCurrentUser(): CurrentUser | null {
  const token = getToken()
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 3) return null
  try {
    const payload = JSON.parse(
      atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')),
    ) as { userId?: string; role?: string }
    if (!payload.userId) return null
    return { id: payload.userId, role: payload.role || 'customer' }
  } catch {
    return null
  }
}

export function isAdmin() {
  const user = getCurrentUser()
  return !!user && user.role === 'admin'
}

export function clearToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token')
  }
}
