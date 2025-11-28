<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <div class="logo-icon">
          <AppIcon name="sparkle" size="xl" />
        </div>
        <h1>Create Account</h1>
        <p>Join AI Rooms and start collaborating</p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="form-group">
          <label for="username">Username</label>
          <div class="input-wrapper">
            <span class="input-icon">
              <AppIcon name="user" size="sm" />
            </span>
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
            <span class="input-icon">
              <AppIcon name="lock" size="sm" />
            </span>
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
              <AppIcon :name="showPassword ? 'eye' : 'eye-off'" size="sm" />
            </button>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="input-wrapper">
            <span class="input-icon">
              <AppIcon name="key" size="sm" />
            </span>
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

        <div v-if="error" class="error-message">
          <AppIcon name="alert" size="sm" />
          {{ error }}
        </div>

        <AppButton type="submit" variant="success" fullWidth :loading="isLoading">
          Create Account
        </AppButton>
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
import AppIcon from '@/components/ui/AppIcon.vue'
import AppButton from '@/components/ui/AppButton.vue'

const router = useRouter()
const isLoading = ref(false)
const showPassword = ref(false)
const error = ref('')
const confirmPassword = ref('')

const userData = reactive({
  username: '',
  password: '',
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
  background: linear-gradient(135deg, var(--success) 0%, #38ef7d 100%);
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
  background: var(--surface-elevated);
  border-radius: 24px;
  padding: 3rem;
  width: 100%;
  max-width: 440px;
  box-shadow: var(--shadow-xl);
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
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, var(--success), #38ef7d);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
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
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
  font-weight: 700;
}

.auth-header p {
  color: var(--text-muted);
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
  color: var(--text-secondary);
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
  color: var(--text-muted);
  z-index: 1;
  display: flex;
  align-items: center;
}

.input-wrapper input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: var(--input-bg);
  color: var(--text-primary);
}

.input-wrapper input::placeholder {
  color: var(--text-muted);
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--success);
  background: var(--surface-elevated);
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
}

.input-wrapper input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: var(--text-muted);
  transition: color 0.2s;
  display: flex;
  align-items: center;
}

.toggle-password:hover {
  color: var(--text-primary);
}

.error-message {
  background: var(--error-bg);
  border: 1px solid var(--error);
  color: var(--error);
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

.auth-footer {
  text-align: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--border);
}

.auth-footer p {
  color: var(--text-muted);
  margin: 0;
}

.auth-footer a {
  color: var(--success);
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
  background: linear-gradient(135deg, var(--success), #38ef7d);
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
