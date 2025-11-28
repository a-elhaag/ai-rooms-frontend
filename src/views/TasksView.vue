<script setup>
import { ref, computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const tasks = ref([
  {
    id: 1,
    title: 'Review AI suggestions',
    room: 'Product Planning',
    status: 'pending',
    priority: 'high',
    due: '2025-11-28',
  },
  {
    id: 2,
    title: 'Update knowledge base',
    room: 'Research',
    status: 'in-progress',
    priority: 'medium',
    due: '2025-11-30',
  },
  {
    id: 3,
    title: 'Prepare presentation',
    room: 'Marketing',
    status: 'completed',
    priority: 'low',
    due: '2025-11-25',
  },
])

const filter = ref('all')
const showCreateModal = ref(false)

const filteredTasks = computed(() => {
  if (filter.value === 'all') return tasks.value
  return tasks.value.filter((t) => t.status === filter.value)
})

const taskCounts = computed(() => ({
  all: tasks.value.length,
  pending: tasks.value.filter((t) => t.status === 'pending').length,
  'in-progress': tasks.value.filter((t) => t.status === 'in-progress').length,
  completed: tasks.value.filter((t) => t.status === 'completed').length,
}))

const getPriorityClass = (priority) => `priority-${priority}`
const getStatusClass = (status) => `status-${status}`

const formatDate = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diff = date - now
  const days = Math.ceil(diff / 86400000)

  if (days < 0) return 'Overdue'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  if (days < 7) return `${days} days`
  return date.toLocaleDateString()
}
</script>

<template>
  <div class="tasks-view">
    <!-- Header -->
    <header class="view-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="view-title">My Tasks</h1>
          <p class="view-subtitle">Track and manage your tasks across all rooms</p>
        </div>
        <button class="btn btn-primary btn-new" @click="showCreateModal = true">
          <span class="btn-icon-circle">
            <AppIcon name="plus" size="sm" />
          </span>
          <span>New Task</span>
        </button>
      </div>
    </header>

    <!-- Stats Row -->
    <div class="stats-row">
      <button
        v-for="(count, status) in taskCounts"
        :key="status"
        class="stat-card"
        :class="{ active: filter === status }"
        @click="filter = status"
      >
        <div class="stat-label">
          {{ status === 'all' ? 'All Tasks' : status.replace('-', ' ') }}
        </div>
        <div class="stat-value">{{ count }}</div>
      </button>
    </div>

    <!-- Tasks Content -->
    <div class="view-content">
      <div v-if="filteredTasks.length === 0" class="empty-state">
        <div class="empty-illustration">
          <div class="empty-icon-wrap">
            <AppIcon name="check-circle" size="xl" />
          </div>
        </div>
        <h3>No tasks found</h3>
        <p>Create a new task to get started</p>
        <button class="btn btn-primary" @click="showCreateModal = true">Create Task</button>
      </div>

      <div v-else class="tasks-list">
        <article
          v-for="task in filteredTasks"
          :key="task.id"
          class="task-card"
          :class="getStatusClass(task.status)"
        >
          <div class="task-checkbox">
            <input type="checkbox" :checked="task.status === 'completed'" />
          </div>

          <div class="task-main">
            <div class="task-header">
              <h3 class="task-title">{{ task.title }}</h3>
              <span class="priority-badge" :class="getPriorityClass(task.priority)">
                {{ task.priority }}
              </span>
            </div>

            <div class="task-meta">
              <span class="task-room">
                <AppIcon name="room" size="sm" />
                {{ task.room }}
              </span>
              <span class="task-due" :class="{ overdue: formatDate(task.due) === 'Overdue' }">
                <AppIcon name="clock" size="sm" />
                {{ formatDate(task.due) }}
              </span>
            </div>
          </div>

          <div class="task-actions">
            <button class="icon-btn">
              <AppIcon name="more-horizontal" size="sm" />
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.tasks-view {
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
  justify-content: space-between;
}

.view-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.view-subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  box-shadow: 0 4px 14px var(--primary-glow);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px var(--primary-glow);
}

.btn-icon-circle {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.stats-row {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 2rem;
  overflow-x: auto;
  background: var(--surface);
}

.stat-card {
  flex: 1;
  min-width: 120px;
  padding: 1rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.stat-card:hover {
  border-color: var(--primary-soft);
  box-shadow: var(--shadow-sm);
}

.stat-card.active {
  border-color: var(--primary);
  background: var(--primary-muted);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: capitalize;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.stat-card.active .stat-value {
  color: var(--primary);
}

.view-content {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 2rem 2rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  text-align: center;
}

.empty-illustration {
  width: 120px;
  height: 120px;
  border-radius: 999px;
  background: var(--primary-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: var(--shadow-lg);
}

.empty-icon-wrap {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: 1rem;
  transition: all 0.2s ease;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.task-card:hover {
  border-color: var(--primary-soft);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.task-card.status-completed {
  opacity: 0.7;
}

.task-card.status-completed .task-title {
  text-decoration: line-through;
  color: var(--text-muted);
}

.task-checkbox {
  padding-top: 0.125rem;
}

.task-checkbox input {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  cursor: pointer;
  accent-color: var(--primary);
}

.task-main {
  flex: 1;
  min-width: 0;
}

.task-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.task-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.priority-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-high {
  background: var(--error-muted);
  color: var(--error);
}

.priority-medium {
  background: var(--warning-muted);
  color: var(--warning);
}

.priority-low {
  background: var(--success-muted);
  color: var(--success);
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.task-room,
.task-due {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.task-due.overdue {
  color: var(--error);
}

.task-actions {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.task-card:hover .task-actions {
  opacity: 1;
}

.icon-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: var(--surface);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  color: var(--text-secondary);
}

.icon-btn:hover {
  background: var(--surface-hover);
  color: var(--primary);
}

@media (max-width: 768px) {
  .view-header {
    padding: 1rem 1.25rem;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-row {
    padding: 0.75rem 1.25rem;
  }

  .view-content {
    padding: 0.75rem 1.25rem 1.5rem;
  }
}
</style>
