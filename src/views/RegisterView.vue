<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo-icon">✨</div>
        <h1>Create Account</h1>
        <p>Join AI Rooms and start collaborating</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrapper">
            <span class="input-icon">👤</span>
            <input
              id="username"
              v-model="userData.username"
              type="text"
              placeholder="Choose a username"
              required
              minlength="3"
              maxlength="50"
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper">
            <span class="input-icon">🔑</span>
            <input
              id="password"
              v-model="userData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Create a password"
              required
              minlength="3"
              :disabled="isLoading"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '👁️' : '🔒' }}
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="input-wrapper">
            <span class="input-icon">🔐</span>
            <input
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Confirm your password"
              required
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="language">Preferred Language</label>
          <div class="input-wrapper select-wrapper">
            <span class="input-icon">🌐</span>
            <select id="language" v-model="userData.preferred_language" :disabled="isLoading">
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>
        </div>

        <div v-if="error" class="error-message">
          <span class="error-icon">⚠️</span>
          {{ error }}
        </div>

        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="isLoading" class="loading-spinner"></span>
          <span v-else>Create Account</span>
        </button>
      </form>

      <div class="auth-footer">
        <p>Already have an account? <router-link to="/login">Sign in</router-link></p>
      </div>

      <div class="auth-decoration">
        <div class="floating-shape shape-1"></div>
        <div class="floating-shape shape-2"></div>
        <div class="floating-shape shape-3"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '@/services/authService'

const router = useRouter()
const isLoading = ref(false)
const showPassword = ref(false)
const error = ref('')
const confirmPassword = ref('')

const userData = reactive({
  username: '',
  password: '',
  preferred_language: 'en',
})

async function handleRegister() {
  error.value = ''

  // Validate passwords match
  if (userData.password !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  isLoading.value = true

  try {
    const user = await register(userData)
    // Store user in localStorage for POC
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('userId', user.id)
    router.push('/')
  } catch (err) {
    error.value = err.response?.data?.detail || 'Registration failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  position: relative;
  overflow: hidden;
}

.auth-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
  pointer-events: none;
}

.auth-card {
  background: white;
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 440px;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.2);
  position: relative;
  overflow: hidden;
  animation: slideUp 0.6s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.auth-header h1 {
  font-size: 1.75rem;
  color: #1a1a2e;
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.auth-header p {
  color: #6b7280;
  margin: 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  font-size: 1rem;
  z-index: 1;
}

.input-wrapper input,
.input-wrapper select {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f9fafb;
}

.input-wrapper input:focus,
.input-wrapper select:focus {
  outline: none;
  border-color: #11998e;
  background: white;
  box-shadow: 0 0 0 4px rgba(17, 153, 142, 0.1);
}

.input-wrapper input:disabled,
.input-wrapper select:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.select-wrapper select {
  appearance: none;
  cursor: pointer;
  padding-right: 2.5rem;
}

.select-wrapper::after {
  content: '▼';
  position: absolute;
  right: 1rem;
  font-size: 0.75rem;
  color: #6b7280;
  pointer-events: none;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.toggle-password:hover {
  opacity: 1;
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  animation: shake 0.5s ease-out;
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.btn-primary {
  background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-height: 52px;
  margin-top: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(17, 153, 142, 0.4);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e5e7eb;
}

.auth-footer p {
  color: #6b7280;
  margin: 0;
}

.auth-footer a {
  color: #11998e;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;
}

.auth-footer a:hover {
  color: #38ef7d;
}

.auth-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.floating-shape {
  position: absolute;
  border-radius: 50%;
  opacity: 0.1;
  background: linear-gradient(135deg, #11998e, #38ef7d);
}

.shape-1 {
  width: 100px;
  height: 100px;
  top: -30px;
  right: -30px;
  animation: float 4s ease-in-out infinite;
}

.shape-2 {
  width: 60px;
  height: 60px;
  bottom: 20%;
  left: -20px;
  animation: float 5s ease-in-out infinite reverse;
}

.shape-3 {
  width: 40px;
  height: 40px;
  bottom: -10px;
  right: 20%;
  animation: float 6s ease-in-out infinite;
}
</style>
