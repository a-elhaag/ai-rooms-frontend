<script setup>
import { ref, computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import AppIcon from '@/components/ui/AppIcon.vue'

const route = useRoute()
const router = useRouter()
const sidebarCollapsed = ref(false)
const user = ref(null)
const mobileMenuOpen = ref(false)

const currentRouteName = computed(() => {
  return route.name || 'home'
})

// Check if current route is an auth page
const isAuthPage = computed(() => {
  return ['login', 'register'].includes(route.name)
})

const toggleSidebar = () => {
  if (window.innerWidth <= 768) {
    mobileMenuOpen.value = !mobileMenuOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

// Load user from localStorage
const loadUser = () => {
  const storedUser = localStorage.getItem('user')
  if (storedUser) {
    try {
      user.value = JSON.parse(storedUser)
    } catch {
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
  // Responsive sidebar handling
  if (window.innerWidth <= 768) {
    sidebarCollapsed.value = true
  }
})

// Watch for route changes to reload user and close mobile menu
router.afterEach(() => {
  loadUser()
  mobileMenuOpen.value = false
})
</script>

<template>
  <!-- Auth pages - no sidebar -->
  <div v-if="isAuthPage" class="auth-wrapper">
    <RouterView />
  </div>

  <!-- Main app with sidebar -->
  <div v-else class="app-container">
    <!-- Mobile Menu Button -->
    <button class="mobile-menu-btn" @click="toggleSidebar">
      <AppIcon :name="mobileMenuOpen ? 'x' : 'menu'" size="md" />
    </button>

    <!-- Overlay for mobile -->
    <div v-if="mobileMenuOpen" class="mobile-overlay" @click="mobileMenuOpen = false"></div>

    <!-- Sidebar -->
    <aside
      class="sidebar"
      :class="{
        collapsed: sidebarCollapsed && !mobileMenuOpen,
        'mobile-open': mobileMenuOpen,
      }"
    >
      <div class="sidebar-header">
        <div class="logo">
          <div class="logo-icon">
            <AppIcon name="monitor" size="md" />
          </div>
          <transition name="slide-fade">
            <span v-if="!sidebarCollapsed || mobileMenuOpen" class="logo-text">AI Rooms</span>
          </transition>
        </div>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/" class="nav-item" :class="{ active: currentRouteName === 'home' }">
          <span class="nav-icon">
            <AppIcon name="home" size="md" />
          </span>
          <transition name="slide-fade">
            <span v-if="!sidebarCollapsed || mobileMenuOpen" class="nav-label">Rooms</span>
          </transition>
        </RouterLink>

        <RouterLink to="/tasks" class="nav-item" :class="{ active: currentRouteName === 'tasks' }">
          <span class="nav-icon">
            <AppIcon name="check-circle" size="md" />
          </span>
          <transition name="slide-fade">
            <span v-if="!sidebarCollapsed || mobileMenuOpen" class="nav-label">My Tasks</span>
          </transition>
        </RouterLink>
      </nav>

      <div class="sidebar-spacer"></div>

      <div class="sidebar-bottom-nav">
        <RouterLink
          to="/settings"
          class="nav-item"
          :class="{ active: currentRouteName === 'settings' }"
        >
          <span class="nav-icon">
            <AppIcon name="settings" size="md" />
          </span>
          <transition name="slide-fade">
            <span v-if="!sidebarCollapsed || mobileMenuOpen" class="nav-label">Settings</span>
          </transition>
        </RouterLink>
      </div>

      <div class="sidebar-footer">
        <!-- Show user info if logged in -->
        <div v-if="user" class="user-profile">
          <div class="user-avatar">
            <AppIcon name="user" size="sm" />
          </div>
          <transition name="slide-fade">
            <div v-if="!sidebarCollapsed || mobileMenuOpen" class="user-info">
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
            <button
              v-if="!sidebarCollapsed || mobileMenuOpen"
              class="logout-btn"
              @click="logout"
              title="Logout"
            >
              <AppIcon name="logout" size="sm" />
            </button>
          </transition>
        </div>

        <!-- Show login link if not logged in -->
        <div v-else class="login-prompt">
          <RouterLink to="/login" class="login-link">
            <AppIcon name="login" size="md" />
            <transition name="slide-fade">
              <span v-if="!sidebarCollapsed || mobileMenuOpen">Sign In</span>
            </transition>
          </RouterLink>
        </div>

        <button
          v-if="!mobileMenuOpen"
          class="collapse-btn"
          @click="toggleSidebar"
          :title="sidebarCollapsed ? 'Expand' : 'Collapse'"
        >
          <AppIcon name="chevron-right" size="sm" :class="{ rotated: !sidebarCollapsed }" />
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

/* Mobile Menu Button */
.mobile-menu-btn {
  display: none;
  position: fixed;
  top: max(1rem, env(safe-area-inset-top, 1rem));
  left: max(1rem, env(safe-area-inset-left, 1rem));
  z-index: 1001;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.65rem;
  cursor: pointer;
  box-shadow: var(--shadow-md);
  color: var(--text-primary);
  transition: all 0.2s ease;
  -webkit-tap-highlight-color: transparent;
}

.mobile-menu-btn:active {
  transform: scale(0.95);
  background: var(--surface-hover);
}

.mobile-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 999;
  animation: fadeIn 0.2s ease;
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
  z-index: 1000;
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
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.3);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  color: white;
}

.logo-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 12px 28px rgba(37, 99, 235, 0.4);
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--primary);
}

/* Navigation */
.sidebar-nav {
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

.nav-label {
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

/* Sidebar Spacer - pushes bottom nav down */
.sidebar-spacer {
  flex: 1;
}

/* Bottom Nav - Settings at bottom */
.sidebar-bottom-nav {
  padding: 0 var(--space-3);
  padding-bottom: var(--space-2);
  border-top: 1px solid var(--border);
  padding-top: var(--space-2);
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

.status-dot {
  width: 6px;
  height: 6px;
  background: var(--success);
  border-radius: 50%;
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
  background: linear-gradient(135deg, var(--primary), var(--primary-strong));
  color: white;
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-weight: 600;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.login-link:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
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

.rotated {
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
  .mobile-menu-btn {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-overlay {
    display: block;
  }

  .sidebar {
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    z-index: 1000;
    transform: translateX(-100%);
    width: 100vw;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding-top: env(safe-area-inset-top, 0);
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: var(--shadow-xl);
  }

  .sidebar.collapsed {
    width: 100vw; /* Don't collapse on mobile, just hide */
  }

  .main-content {
    margin-left: 0;
    padding-top: calc(3.5rem + env(safe-area-inset-top, 0)); /* Space for mobile menu btn */
    height: 100vh;
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }

  .sidebar-footer {
    padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom, 0));
  }

  .nav-item {
    padding: var(--space-3) var(--space-4);
    min-height: 48px; /* Touch-friendly target */
  }

  .collapse-btn {
    display: none;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100vw;
  }

  .logo-text {
    font-size: 1.1rem;
  }
}
</style>
