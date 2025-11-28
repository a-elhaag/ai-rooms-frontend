import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    // Add X-User-Id header for POC mode authentication
    const userId = localStorage.getItem('user_id')
    if (userId) {
      config.headers['X-User-Id'] = userId
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle global errors (e.g., 401 Unauthorized)
    if (error.response && error.response.status === 401) {
      // TODO: Handle logout or token refresh
      console.warn('Unauthorized access - redirect to login?')
    }
    return Promise.reject(error)
  },
)

export default apiClient
