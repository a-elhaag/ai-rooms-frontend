<script setup>
import { ref, onMounted, watch } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppButton from '@/components/ui/AppButton.vue'

const user = ref({
  username: 'User',
  email: 'user@example.com',
})

const theme = ref('light')
const aiStyle = ref('balanced')
const aiSuggestions = ref(true)
const autoSummarize = ref(true)

// Initialize theme from localStorage or system preference
onMounted(() => {
  const savedTheme = localStorage.getItem('theme')
  if (savedTheme) {
    theme.value = savedTheme
  } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    theme.value = 'auto'
  }
  applyTheme()
})

// Watch for theme changes and apply
watch(theme, () => {
  applyTheme()
  localStorage.setItem('theme', theme.value)
})

function applyTheme() {
  const html = document.documentElement
  if (theme.value === 'dark') {
    html.setAttribute('data-theme', 'dark')
  } else if (theme.value === 'light') {
    html.removeAttribute('data-theme')
  } else {
    // Auto: use system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      html.setAttribute('data-theme', 'dark')
    } else {
      html.removeAttribute('data-theme')
    }
  }
}

const saveSettings = () => {
  // TODO: Save to backend
  console.log('Settings saved')
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
      <!-- Profile Section -->
      <section class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <AppIcon name="user" size="sm" />
          </div>
          <div>
            <h2 class="section-title">Profile</h2>
            <p class="section-desc">Your personal information</p>
          </div>
        </div>

        <div class="settings-card">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Username</label>
              <input type="text" class="form-input" v-model="user.username" />
            </div>
            <div class="form-group">
              <label class="form-label">Email</label>
              <input type="email" class="form-input" v-model="user.email" />
            </div>
          </div>
        </div>
      </section>

      <!-- Appearance Section -->
      <section class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <AppIcon name="sun" size="sm" />
          </div>
          <div>
            <h2 class="section-title">Appearance</h2>
            <p class="section-desc">Customize how the app looks</p>
          </div>
        </div>

        <div class="settings-card">
          <div class="theme-options">
            <button
              class="theme-option"
              :class="{ active: theme === 'light' }"
              @click="theme = 'light'"
            >
              <div class="theme-preview theme-light">
                <div class="preview-sidebar"></div>
                <div class="preview-content"></div>
              </div>
              <div class="theme-label">
                <AppIcon name="sun" size="sm" />
                <span>Light</span>
              </div>
            </button>
            <button
              class="theme-option"
              :class="{ active: theme === 'dark' }"
              @click="theme = 'dark'"
            >
              <div class="theme-preview theme-dark">
                <div class="preview-sidebar"></div>
                <div class="preview-content"></div>
              </div>
              <div class="theme-label">
                <AppIcon name="moon" size="sm" />
                <span>Dark</span>
              </div>
            </button>
            <button
              class="theme-option"
              :class="{ active: theme === 'auto' }"
              @click="theme = 'auto'"
            >
              <div class="theme-preview theme-auto">
                <div class="preview-sidebar"></div>
                <div class="preview-content"></div>
              </div>
              <div class="theme-label">
                <AppIcon name="monitor" size="sm" />
                <span>Auto</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      <!-- AI Settings Section -->
      <section class="settings-section">
        <div class="section-header">
          <div class="section-icon ai-icon">
            <AppIcon name="sparkle" size="sm" />
          </div>
          <div>
            <h2 class="section-title">AI Settings</h2>
            <p class="section-desc">Configure AI behavior</p>
          </div>
        </div>

        <div class="settings-card">
          <div class="form-group">
            <label class="form-label">Response Style</label>
            <div class="radio-group">
              <label class="radio-option" :class="{ active: aiStyle === 'concise' }">
                <input type="radio" v-model="aiStyle" value="concise" />
                <div class="radio-content">
                  <span class="radio-title">Concise</span>
                  <span class="radio-desc">Short, to-the-point responses</span>
                </div>
              </label>
              <label class="radio-option" :class="{ active: aiStyle === 'balanced' }">
                <input type="radio" v-model="aiStyle" value="balanced" />
                <div class="radio-content">
                  <span class="radio-title">Balanced</span>
                  <span class="radio-desc">Mix of detail and brevity</span>
                </div>
              </label>
              <label class="radio-option" :class="{ active: aiStyle === 'detailed' }">
                <input type="radio" v-model="aiStyle" value="detailed" />
                <div class="radio-content">
                  <span class="radio-title">Detailed</span>
                  <span class="radio-desc">Comprehensive explanations</span>
                </div>
              </label>
            </div>
          </div>

          <div class="toggle-group">
            <label class="toggle-option">
              <div class="toggle-info">
                <span class="toggle-title">AI Suggestions</span>
                <span class="toggle-desc">Get proactive suggestions from AI</span>
              </div>
              <div
                class="toggle-switch"
                :class="{ on: aiSuggestions }"
                @click="aiSuggestions = !aiSuggestions"
              >
                <div class="toggle-knob"></div>
              </div>
            </label>
            <label class="toggle-option">
              <div class="toggle-info">
                <span class="toggle-title">Auto-summarize</span>
                <span class="toggle-desc">Automatically summarize long conversations</span>
              </div>
              <div
                class="toggle-switch"
                :class="{ on: autoSummarize }"
                @click="autoSummarize = !autoSummarize"
              >
                <div class="toggle-knob"></div>
              </div>
            </label>
          </div>
        </div>
      </section>

      <!-- Save Button -->
      <div class="save-bar">
        <AppButton variant="primary" @click="saveSettings">
          <AppIcon name="save" size="sm" />
          Save Changes
        </AppButton>
      </div>
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
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primary), var(--primary-soft));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-glow);
  color: white;
}

.view-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.15rem;
}

.view-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.view-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem 2rem;
  max-width: 720px;
}

.settings-section {
  margin-bottom: 2rem;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
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

.section-icon.ai-icon {
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
  padding: 1.25rem;
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

.theme-options {
  display: flex;
  gap: 1rem;
}

.theme-option {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 1rem;
  border: 2px solid var(--border);
  border-radius: 1rem;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  border-color: var(--primary-soft);
}

.theme-option.active {
  border-color: var(--primary);
  background: var(--primary-muted);
}

.theme-preview {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  display: flex;
  overflow: hidden;
  border: 1px solid var(--border);
}

.preview-sidebar {
  width: 20%;
}

.preview-content {
  flex: 1;
}

.theme-light .preview-sidebar {
  background: #f3f4f6;
}

.theme-light .preview-content {
  background: #ffffff;
}

.theme-dark .preview-sidebar {
  background: #1e293b;
}

.theme-dark .preview-content {
  background: #0f172a;
}

.theme-auto .preview-sidebar {
  background: linear-gradient(180deg, #f3f4f6 50%, #1e293b 50%);
}

.theme-auto .preview-content {
  background: linear-gradient(180deg, #ffffff 50%, #0f172a 50%);
}

.theme-label {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
}

.theme-option.active .theme-label {
  color: var(--primary);
}

.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-option:hover {
  border-color: var(--primary-soft);
  background: var(--surface);
}

.radio-option.active {
  border-color: var(--primary);
  background: var(--primary-muted);
}

.radio-option input {
  width: 18px;
  height: 18px;
  accent-color: var(--primary);
}

.radio-content {
  display: flex;
  flex-direction: column;
}

.radio-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.radio-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--border-subtle);
}

.toggle-option {
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
}

.toggle-info {
  display: flex;
  flex-direction: column;
}

.toggle-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text-primary);
}

.toggle-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: var(--border-strong);
  border-radius: 999px;
  padding: 2px;
  transition: background 0.2s ease;
  cursor: pointer;
}

.toggle-switch.on {
  background: linear-gradient(135deg, var(--primary), var(--primary-soft));
}

.toggle-knob {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 999px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease;
}

.toggle-switch.on .toggle-knob {
  transform: translateX(20px);
}

.save-bar {
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border);
}

@media (max-width: 768px) {
  .view-header {
    padding: 1rem 1.25rem;
  }

  .view-content {
    padding: 1rem 1.25rem 1.5rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .theme-options {
    flex-direction: column;
  }
}
</style>
