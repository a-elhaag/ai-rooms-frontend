import apiClient from '@/api'

export default {
  async register(userData) {
    // userData: { username, password, preferred_language }
    const response = await apiClient.post('/auth/register', userData)
    return response.data
  },

  async login(credentials) {
    // credentials: { username, password }
    const response = await apiClient.post('/auth/login', credentials)
    return response.data
  },

  async getCurrentUser() {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
}
