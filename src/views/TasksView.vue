<script setup>
import { ref, computed } from 'vue'

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
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
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
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
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
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="14" rx="2" />
                  <path d="M7 9h10" />
                </svg>
                {{ task.room }}
              </span>
              <span class="task-due" :class="{ overdue: formatDate(task.due) === 'Overdue' }">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {{ formatDate(task.due) }}
              </span>
            </div>
          </div>

          <div class="task-actions">
            <button class="icon-btn">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
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
  justify-content: space-between;
}

.view-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 0.25rem;
}

.view-subtitle {
  color: #6b7280;
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
  background: linear-gradient(135deg, #2563eb, #3b82f6);
  color: white;
  box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 99, 235, 0.45);
}

.btn-icon-circle {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon-circle svg {
  width: 12px;
  height: 12px;
  stroke: currentColor;
  stroke-width: 2;
  fill: none;
}

.stats-row {
  display: flex;
  gap: 0.75rem;
  padding: 1rem 2rem;
  overflow-x: auto;
}

.stat-card {
  flex: 1;
  min-width: 120px;
  padding: 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.stat-card:hover {
  border-color: #bfdbfe;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
}

.stat-card.active {
  border-color: #2563eb;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  text-transform: capitalize;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0f172a;
}

.stat-card.active .stat-value {
  color: #2563eb;
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
  background: radial-gradient(circle at 30% 30%, #bfdbfe, #eff6ff 60%, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 20px 50px rgba(37, 99, 235, 0.2);
}

.empty-icon-wrap {
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon-wrap svg {
  width: 26px;
  height: 26px;
  stroke: white;
  fill: none;
  stroke-width: 2;
}

.empty-state h3 {
  font-size: 1.25rem;
  color: #0f172a;
}

.empty-state p {
  color: #6b7280;
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
  background: white;
  border: 1px solid #e5e7eb;
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
  border-color: #bfdbfe;
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.08);
  transform: translateY(-2px);
}

.task-card.status-completed {
  opacity: 0.7;
}

.task-card.status-completed .task-title {
  text-decoration: line-through;
  color: #9ca3af;
}

.task-checkbox {
  padding-top: 0.125rem;
}

.task-checkbox input {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  cursor: pointer;
  accent-color: #2563eb;
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
  color: #0f172a;
}

.priority-badge {
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.priority-high {
  background: #fef2f2;
  color: #dc2626;
}

.priority-medium {
  background: #fffbeb;
  color: #d97706;
}

.priority-low {
  background: #f0fdf4;
  color: #16a34a;
}

.task-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6b7280;
}

.task-room,
.task-due {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.task-room svg,
.task-due svg {
  width: 14px;
  height: 14px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.6;
}

.task-due.overdue {
  color: #dc2626;
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
  background: #f3f4f6;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s ease;
}

.icon-btn:hover {
  background: #e5e7eb;
}

.icon-btn svg {
  width: 16px;
  height: 16px;
  stroke: #6b7280;
  fill: #6b7280;
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
