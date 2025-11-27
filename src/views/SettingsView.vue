<script setup>
import { ref } from 'vue'

const user = ref({
  username: 'User',
  email: 'user@example.com',
  preferred_language: 'en',
})

const theme = ref('light')
const aiStyle = ref('balanced')
const aiSuggestions = ref(true)
const autoSummarize = ref(true)

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
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
            />
          </svg>
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
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
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
          <div class="form-group">
            <label class="form-label">Preferred Language</label>
            <select class="form-input" v-model="user.preferred_language">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="ar">Arabic</option>
            </select>
          </div>
        </div>
      </section>

      <!-- Appearance Section -->
      <section class="settings-section">
        <div class="section-header">
          <div class="section-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="5" />
              <path
                d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
              />
            </svg>
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
              <span>Light</span>
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
              <span>Dark</span>
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
              <span>Auto</span>
            </button>
          </div>
        </div>
      </section>

      <!-- AI Settings Section -->
      <section class="settings-section">
        <div class="section-header">
          <div class="section-icon ai-icon">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="6" cy="12" r="2.5" />
              <circle cx="12" cy="12" r="2.5" />
              <circle cx="18" cy="12" r="2.5" />
            </svg>
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
        <button class="btn btn-primary btn-save" @click="saveSettings">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" />
            <polyline points="7 3 7 8 15 8" />
          </svg>
          Save Changes
        </button>
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
  background: radial-gradient(circle at top, #eef4ff 0%, #f9fafb 50%, #ffffff 100%);
}

.view-header {
  padding: 1.5rem 2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: saturate(180%) blur(12px);
  border-bottom: 1px solid #e5e7eb;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
}

.header-icon svg {
  width: 24px;
  height: 24px;
  stroke: white;
  fill: none;
  stroke-width: 2;
}

.view-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.15rem;
}

.view-subtitle {
  color: #6b7280;
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
  background: #eff6ff;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-icon svg {
  width: 18px;
  height: 18px;
  stroke: #2563eb;
  fill: none;
  stroke-width: 2;
}

.section-icon.ai-icon svg {
  stroke-width: 0;
  fill: #2563eb;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #0f172a;
}

.section-desc {
  font-size: 0.8rem;
  color: #9ca3af;
}

.settings-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  padding: 1.25rem;
  transition: box-shadow 0.2s ease;
}

.settings-card:hover {
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.06);
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
  color: #374151;
  margin-bottom: 0.4rem;
}

.form-input {
  width: 100%;
  padding: 0.6rem 0.9rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  font-size: 0.9rem;
  color: #0f172a;
  background: #f9fafb;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #2563eb;
  background: white;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

select.form-input {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  padding-right: 2.5rem;
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
  border: 2px solid #e5e7eb;
  border-radius: 1rem;
  background: transparent;
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-option:hover {
  border-color: #bfdbfe;
}

.theme-option.active {
  border-color: #2563eb;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}

.theme-preview {
  width: 100%;
  height: 48px;
  border-radius: 8px;
  display: flex;
  overflow: hidden;
  border: 1px solid #e5e7eb;
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

.theme-option span {
  font-size: 0.85rem;
  font-weight: 500;
  color: #374151;
}

.theme-option.active span {
  color: #2563eb;
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
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.radio-option:hover {
  border-color: #bfdbfe;
  background: #f9fafb;
}

.radio-option.active {
  border-color: #2563eb;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}

.radio-option input {
  width: 18px;
  height: 18px;
  accent-color: #2563eb;
}

.radio-content {
  display: flex;
  flex-direction: column;
}

.radio-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: #0f172a;
}

.radio-desc {
  font-size: 0.75rem;
  color: #9ca3af;
}

.toggle-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1.25rem;
  padding-top: 1.25rem;
  border-top: 1px solid #f3f4f6;
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
  color: #0f172a;
}

.toggle-desc {
  font-size: 0.75rem;
  color: #9ca3af;
}

.toggle-switch {
  width: 44px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 999px;
  padding: 2px;
  transition: background 0.2s ease;
  cursor: pointer;
}

.toggle-switch.on {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
}

.toggle-knob {
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 999px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}

.toggle-switch.on .toggle-knob {
  transform: translateX(20px);
}

.save-bar {
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.7rem 1.4rem;
  border-radius: 999px;
  font-size: 0.9rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
}

.btn-save svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
  fill: none;
  stroke-width: 2;
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
