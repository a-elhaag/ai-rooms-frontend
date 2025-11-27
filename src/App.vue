<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const sidebarCollapsed = ref(false)
const user = ref(null)

const currentRouteName = computed(() => {
  return route.name || 'home'
})

// Check if current route is an auth page
const isAuthPage = computed(() => {
  return ['login', 'register'].includes(route.name)
})

const toggleSidebar = () => {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

// Load user from localStorage
const loadUser = () => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch (e) {
      user.value = null
    }
  }
}

// Logout
const logout = () => {
  localStorage.removeItem('user')
  localStorage.removeItem('userId')
  user.value = null
  router.push('/login')
}

onMounted(() => {
  loadUser()
})

// Watch for route changes to reload user
router.afterEach(() => {
  loadUser()
})
</script>

<template>
  <!-- Auth pages - no sidebar -->
  <div v-if="isAuthPage" class="auth-wrapper">
    <RouterView />
  </div>

  <!-- Main app with sidebar -->
  <div v-else class="app-container">
    <!-- Sidebar -->
    <aside class="sidebar" :class="{ collapsed: sidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="8" height="8" rx="2" />
              <rect x="13" y="4" width="8" height="5" rx="2" />
              <rect x="13" y="11" width="8" height="9" rx="2" />
            </svg>
          </div>
          <transition name="slide-fade">
            <span v-if="!sidebarCollapsed" class="logo-text">AI Rooms</span>
          </transition>
        </div>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/" class="nav-item" :class="{ active: currentRouteName === 'home' }">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <rect x="3" y="4" width="18" height="14" rx="2" />
              <path d="M7 9h10" />
              <path d="M7 13h6" />
            </svg>
          </span>
          <transition name="slide-fade">
            <span v-if="!sidebarCollapsed" class="nav-label">Rooms</span>
          </transition>
        </RouterLink>

        <RouterLink to="/tasks" class="nav-item" :class="{ active: currentRouteName === 'tasks' }">
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </span>
          <transition name="slide-fade">
            <span v-if="!sidebarCollapsed" class="nav-label">My Tasks</span>
          </transition>
        </RouterLink>

        <RouterLink
          to="/knowledge"
          class="nav-item"
          :class="{ active: currentRouteName === 'knowledge' }"
        >
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8 7h8" />
              <path d="M8 11h6" />
            </svg>
          </span>
          <transition name="slide-fade">
            <span v-if="!sidebarCollapsed" class="nav-label">Knowledge</span>
          </transition>
        </RouterLink>

        <RouterLink
          to="/settings"
          class="nav-item"
          :class="{ active: currentRouteName === 'settings' }"
        >
          <span class="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              />
            </svg>
          </span>
          <transition name="slide-fade">
            <span v-if="!sidebarCollapsed" class="nav-label">Settings</span>
          </transition>
        </RouterLink>
      </nav>

      <div class="sidebar-footer">
        <!-- Show user info if logged in -->
        <div v-if="user" class="user-profile">
          <div class="user-avatar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <transition name="slide-fade">
            <div v-if="!sidebarCollapsed" class="user-info">
              <div class="user-name">{{ user.username }}</div>
              <div class="user-status">
                <span class="status-dot status-active"></span>
                <span class="status-text">{{
                  user.preferred_language === 'ar' ? 'عربي' : 'English'
                }}</span>
              </div>
            </div>
          </transition>
          <transition name="slide-fade">
            <button v-if="!sidebarCollapsed" class="logout-btn" @click="logout" title="Logout">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                width="18"
                height="18"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </transition>
        </div>

        <!-- Show login link if not logged in -->
        <div v-else class="login-prompt">
          <RouterLink to="/login" class="login-link">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              width="20"
              height="20"
            >
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
            <transition name="slide-fade">
              <span v-if="!sidebarCollapsed">Sign In</span>
            </transition>
          </RouterLink>
        </div>

        <button
          class="collapse-btn"
          @click="toggleSidebar"
          :title="sidebarCollapsed ? 'Expand' : 'Collapse'"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            :class="{ rotated: sidebarCollapsed }"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <RouterView v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </main>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--background);
}

/* Sidebar */
.sidebar {
  width: 260px;
  height: 100vh;
  background: var(--surface-elevated);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  box-shadow: var(--shadow-sm);
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header {
  padding: var(--space-5) var(--space-4);
  border-bottom: 1px solid var(--border);
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primary), var(--primary-soft));
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.logo-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.4);
}

.logo-icon svg {
  width: 20px;
  height: 20px;
  color: white;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: var(--space-4) var(--space-3);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-3);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
  position: relative;
  overflow: hidden;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 3px;
  height: 100%;
  background: var(--primary);
  transform: scaleY(0);
  transition: transform 0.2s ease;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.nav-item:hover {
  background: var(--surface);
  color: var(--text-primary);
}

.nav-item.active {
  background: var(--primary-muted);
  color: var(--primary);
}

.nav-item.active::before {
  transform: scaleY(1);
}

.nav-icon {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.nav-icon svg {
  width: 20px;
  height: 20px;
}

.nav-label {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

/* Sidebar Footer */
.sidebar-footer {
  padding: var(--space-4);
  border-top: 1px solid var(--border);
}

.user-profile {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.user-avatar {
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--surface), var(--surface-hover));
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid var(--border);
}

.user-avatar svg {
  width: 18px;
  height: 18px;
  color: var(--text-secondary);
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-status {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: 2px;
}

.status-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.logout-btn {
  background: none;
  border: none;
  padding: 6px;
  border-radius: var(--radius-md);
  cursor: pointer;
  color: var(--text-muted);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  background: #fef2f2;
  color: #dc2626;
}

.login-prompt {
  padding: var(--space-2);
}

.login-link {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.login-link:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.auth-wrapper {
  min-height: 100vh;
}

.collapse-btn {
  width: 100%;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.collapse-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
  border-color: var(--border-strong);
}

.collapse-btn svg {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.collapse-btn svg.rotated {
  transform: rotate(180deg);
}

/* Main Content */
.main-content {
  flex: 1;
  height: 100vh;
  overflow: hidden;
  background: var(--background);
}

/* Transitions */
.slide-fade-enter-active {
  transition: all 0.2s ease;
}

.slide-fade-leave-active {
  transition: all 0.15s ease;
}

.slide-fade-enter-from {
  opacity: 0;
  transform: translateX(-10px);
}

.slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.page-fade-enter-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.page-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    transform: translateX(0);
  }

  .sidebar.collapsed {
    transform: translateX(-100%);
    width: 260px;
  }

  .main-content {
    margin-left: 0;
  }
}
</style>
