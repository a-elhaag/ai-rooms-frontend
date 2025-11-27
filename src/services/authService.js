import apiClient from '@/api'

export async function register(userData) {
  // userData: { username, password, preferred_language }
  const response = await apiClient.post('/auth/register', userData)
  return response.data
}

export async function login(credentials) {
  // credentials: { username, password }
  const response = await apiClient.post('/auth/login', credentials)
  return response.data
}

export async function getCurrentUser() {
  const response = await apiClient.get('/auth/me')
  return response.data
}

export default {
  register,
  login,
  getCurrentUser,
}
