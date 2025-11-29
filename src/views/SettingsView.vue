<script setup>
import { ref, onMounted } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppButton from '@/components/ui/AppButton.vue'
import api from '@/api'

const user = ref({
  username: '',
  email: '',
})

const newUsername = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

const saving = ref(false)
const message = ref({ text: '', type: '' })

// Load user data
const loadUser = () => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    const userData = JSON.parse(storedUser)
    user.value = userData
    newUsername.value = userData.username
  }
}

onMounted(() => {
  loadUser()
})

const showMessage = (text, type = 'success') => {
  message.value = { text, type }
  setTimeout(() => {
    message.value = { text: '', type: '' }
  }, 3000)
}

const saveProfile = async () => {
  if (saving.value) return

  if (!newUsername.value.trim()) {
    showMessage('Username is required', 'error')
    return
  }

  saving.value = true
  try {
    const response = await api.patch('/auth/profile', {
      username: newUsername.value.trim(),
    })

    // Update local storage
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}')
    storedUser.username = newUsername.value.trim()
    localStorage.setItem('user', JSON.stringify(storedUser))
    user.value.username = newUsername.value.trim()

    showMessage('Profile updated successfully')
  } catch (error) {
    showMessage(error.response?.data?.detail || 'Failed to update profile', 'error')
  } finally {
    saving.value = false
  }
}

const changePassword = async () => {
  if (saving.value) return

  if (!currentPassword.value) {
    showMessage('Current password is required', 'error')
    return
  }

  if (!newPassword.value) {
    showMessage('New password is required', 'error')
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    showMessage('Passwords do not match', 'error')
    return
  }

  if (newPassword.value.length < 6) {
    showMessage('Password must be at least 6 characters', 'error')
    return
  }

  saving.value = true
  try {
    await api.patch('/auth/password', {
      current_password: currentPassword.value,
      new_password: newPassword.value,
    })

    // Clear password fields
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''

    showMessage('Password changed successfully')
  } catch (error) {
    showMessage(error.response?.data?.detail || 'Failed to change password', 'error')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="settings-view">
    <!-- Header -->
    <header class="view-header">
      <div class="header-content">
        <div class="header-icon">
          <AppIcon name="settings" size="lg" />
        </div>
        <div>
          <h1 class="view-title">Settings</h1>
          <p class="view-subtitle">Manage your account and preferences</p>
        </div>
      </div>
    </header>

    <!-- Settings Content -->
    <div class="view-content">
      <!-- Status Message -->
      <transition name="fade">
        <div v-if="message.text" class="status-message" :class="message.type">
          <AppIcon :name="message.type === 'error' ? 'alert-circle' : 'check-circle'" size="sm" />
          {{ message.text }}
        </div>
      </transition>

      <!-- Profile Section -->
      <section class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <AppIcon name="user" size="sm" />
          </div>
          <div>
            <h2 class="section-title">Profile</h2>
            <p class="section-desc">Update your username</p>
          </div>
        </div>

        <div class="settings-card">
          <div class="form-group">
            <label class="form-label">Username</label>
            <input
              type="text"
              class="form-input"
              v-model="newUsername"
              placeholder="Enter username"
            />
          </div>
          <div class="form-actions">
            <AppButton variant="primary" @click="saveProfile" :disabled="saving">
              <AppIcon name="save" size="sm" />
              {{ saving ? 'Saving...' : 'Save Profile' }}
            </AppButton>
          </div>
        </div>
      </section>

      <!-- Password Section -->
      <section class="settings-section">
        <div class="section-header">
          <div class="section-icon security-icon">
            <AppIcon name="lock" size="sm" />
          </div>
          <div>
            <h2 class="section-title">Change Password</h2>
            <p class="section-desc">Update your password</p>
          </div>
        </div>

        <div class="settings-card">
          <div class="form-group">
            <label class="form-label">Current Password</label>
            <input
              type="password"
              class="form-input"
              v-model="currentPassword"
              placeholder="Enter current password"
            />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">New Password</label>
              <input
                type="password"
                class="form-input"
                v-model="newPassword"
                placeholder="Enter new password"
              />
            </div>
            <div class="form-group">
              <label class="form-label">Confirm Password</label>
              <input
                type="password"
                class="form-input"
                v-model="confirmPassword"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div class="form-actions">
            <AppButton variant="primary" @click="changePassword" :disabled="saving">
              <AppIcon name="lock" size="sm" />
              {{ saving ? 'Changing...' : 'Change Password' }}
            </AppButton>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.settings-view {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--background);
}

.view-header {
  padding: 1.5rem 2rem;
  background: var(--surface-elevated);
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid var(--border);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, var(--primary), var(--primary-soft));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-glow);
  color: white;
}

.view-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.15rem;
}

.view-subtitle {
  color: var(--text-muted);
  font-size: 0.85rem;
}

.view-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem 1.5rem 2rem;
  max-width: 48rem;
}

/* Status Message */
.status-message {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-message.success {
  background: var(--success-muted, rgba(34, 197, 94, 0.1));
  color: var(--success, #22c55e);
  border: 1px solid var(--success, #22c55e);
}

.status-message.error {
  background: var(--error-muted, rgba(239, 68, 68, 0.1));
  color: var(--error, #ef4444);
  border: 1px solid var(--error, #ef4444);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.settings-section {
  margin-bottom: 2rem;
  padding: 1rem;
  border-radius: 1rem;
  background: var(--surface);
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.85rem;
}

.section-icon {
  width: 36px;
  height: 36px;
  background: var(--primary-muted);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.section-icon.security-icon {
  background: var(--accent-muted);
  color: var(--accent);
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.section-desc {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.settings-card {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: 1rem;
  padding: 1.1rem;
  transition: box-shadow 0.2s ease;
}

.settings-card:hover {
  box-shadow: var(--shadow-md);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  display: block;
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: 0.4rem;
}

.form-input {
  width: 100%;
  padding: 0.6rem 0.9rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  font-size: 0.9rem;
  color: var(--text-primary);
  background: var(--input-bg);
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--surface-elevated);
  box-shadow: 0 0 0 3px var(--primary-muted);
}

.form-input:disabled {
  background: var(--surface);
  color: var(--text-muted);
  cursor: not-allowed;
}

.form-hint {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.form-actions {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-subtle);
}

@media (max-width: 768px) {
  .view-header {
    padding: 1rem 1.25rem;
  }

  .view-content {
    padding: 1rem 1.25rem 1.5rem;
    max-width: 100%;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
