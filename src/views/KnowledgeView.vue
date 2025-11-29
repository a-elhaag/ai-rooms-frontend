<script setup>
import { ref, computed } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppButton from '@/components/ui/AppButton.vue'

const knowledge = ref([
  {
    id: 1,
    title: 'Project Guidelines',
    type: 'document',
    room: 'Product Planning',
    tags: ['guidelines', 'process'],
    createdAt: '2025-11-20',
  },
  {
    id: 2,
    title: 'API Documentation',
    type: 'link',
    room: 'Development',
    tags: ['api', 'docs'],
    createdAt: '2025-11-22',
  },
  {
    id: 3,
    title: 'Meeting Notes - Sprint Review',
    type: 'note',
    room: 'Team Standup',
    tags: ['meeting', 'sprint'],
    createdAt: '2025-11-25',
  },
])

const searchQuery = ref('')
const selectedType = ref('all')
const showCreateModal = ref(false)

const filteredKnowledge = computed(() => {
  let items = knowledge.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter(
      (k) =>
        k.title.toLowerCase().includes(query) ||
        k.tags.some((t) => t.toLowerCase().includes(query)),
    )
  }

  if (selectedType.value !== 'all') {
    items = items.filter((k) => k.type === selectedType.value)
  }

  return items
})

const getTypeIcon = (type) => {
  switch (type) {
    case 'document':
      return 'file'
    case 'link':
      return 'link'
    case 'note':
      return 'file-text'
    default:
      return 'file'
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>

<template>
  <div class="knowledge-view">
    <!-- Header -->
    <header class="view-header">
      <div class="header-content">
        <div class="header-text">
          <h1 class="view-title">Knowledge Base</h1>
          <p class="view-subtitle">Your shared knowledge across all rooms</p>
        </div>
        <AppButton variant="primary" @click="showCreateModal = true">
          <AppIcon name="plus" size="sm" />
          Add Knowledge
        </AppButton>
      </div>
    </header>

    <!-- Search & Filter Bar -->
    <div class="filter-bar">
      <div class="search-box">
        <AppIcon name="search" size="sm" class="search-icon" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search knowledge..."
          class="search-input"
        />
      </div>

      <div class="type-filters">
        <button
          class="filter-btn"
          :class="{ active: selectedType === 'all' }"
          @click="selectedType = 'all'"
        >
          All
        </button>
        <button
          class="filter-btn"
          :class="{ active: selectedType === 'document' }"
          @click="selectedType = 'document'"
        >
          <AppIcon name="file" size="xs" />
          Documents
        </button>
        <button
          class="filter-btn"
          :class="{ active: selectedType === 'link' }"
          @click="selectedType = 'link'"
        >
          <AppIcon name="link" size="xs" />
          Links
        </button>
        <button
          class="filter-btn"
          :class="{ active: selectedType === 'note' }"
          @click="selectedType = 'note'"
        >
          <AppIcon name="file-text" size="xs" />
          Notes
        </button>
      </div>
    </div>

    <!-- Knowledge Content -->
    <div class="view-content">
      <div v-if="filteredKnowledge.length === 0" class="empty-state">
        <div class="empty-illustration">
          <div class="empty-icon-wrap">
            <AppIcon name="book" size="xl" />
          </div>
        </div>
        <h3>No knowledge found</h3>
        <p>Add documents, links, or notes to build your knowledge base</p>
        <AppButton variant="primary" @click="showCreateModal = true"> Add Knowledge </AppButton>
      </div>

      <div v-else class="knowledge-grid">
        <article v-for="item in filteredKnowledge" :key="item.id" class="knowledge-card">
          <div class="card-icon">
            <AppIcon :name="getTypeIcon(item.type)" size="lg" />
          </div>

          <div class="card-content">
            <h3 class="card-title">{{ item.title }}</h3>
            <div class="card-meta">
              <span class="card-room">
                <AppIcon name="room" size="xs" />
                {{ item.room }}
              </span>
              <span class="card-date">{{ formatDate(item.createdAt) }}</span>
            </div>
            <div class="card-tags">
              <span v-for="tag in item.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="icon-btn" title="Open">
              <AppIcon name="external-link" size="sm" />
            </button>
            <button class="icon-btn" title="More">
              <AppIcon name="more-vertical" size="sm" />
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.knowledge-view {
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

.filter-bar {
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--border-subtle);
  background: var(--surface);
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: 999px;
  flex: 1;
  max-width: 320px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-muted);
}

.search-icon {
  color: var(--text-muted);
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: var(--text-primary);
  background: transparent;
}

.search-input::placeholder {
  color: var(--text-muted);
}

.type-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  background: var(--surface-elevated);
  border-radius: 999px;
  font-size: 0.8rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  border-color: var(--primary-soft);
  color: var(--primary);
}

.filter-btn.active {
  background: var(--primary-muted);
  border-color: var(--primary);
  color: var(--primary);
  font-weight: 500;
}

.view-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem 2rem 2rem;
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
  margin-bottom: 0.5rem;
}

.knowledge-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1rem;
}

.knowledge-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: 1rem;
  transition: all 0.25s ease;
  animation: fadeIn 0.4s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.knowledge-card:hover {
  border-color: var(--primary-soft);
  box-shadow: var(--shadow-md);
  transform: translateY(-3px);
}

.card-icon {
  width: 48px;
  height: 48px;
  background: var(--primary-muted);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.card-room {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag {
  padding: 0.2rem 0.6rem;
  background: var(--surface);
  border-radius: 999px;
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.card-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.knowledge-card:hover .card-actions {
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
    padding: 1rem;
    padding-top: calc(3rem + env(safe-area-inset-top, 0)); /* Space for mobile menu */
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .view-title {
    font-size: 1.4rem;
  }

  .view-subtitle {
    font-size: 0.8rem;
  }

  .filter-bar {
    padding: 0.75rem 1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .search-box {
    max-width: none;
  }

  .search-input {
    font-size: 16px; /* Prevent iOS zoom */
  }

  .type-filters {
    overflow-x: auto;
    padding-bottom: 0.25rem;
    scrollbar-width: none;
    -ms-overflow-style: none;
    gap: 0.4rem;
  }

  .type-filters::-webkit-scrollbar {
    display: none;
  }

  .filter-btn {
    flex-shrink: 0;
    padding: 0.5rem 0.85rem;
    min-height: 40px;
  }

  .view-content {
    padding: 1rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
  }

  .knowledge-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .knowledge-card {
    padding: 1rem;
  }

  .card-icon {
    width: 42px;
    height: 42px;
    border-radius: 12px;
  }

  .card-title {
    font-size: 0.95rem;
  }

  .card-meta {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .card-actions {
    opacity: 1;
    flex-direction: row;
  }

  .empty-illustration {
    width: 100px;
    height: 100px;
  }

  .empty-icon-wrap {
    width: 44px;
    height: 44px;
  }

  .empty-state h3 {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .view-header {
    padding: 0.75rem;
    padding-top: calc(2.75rem + env(safe-area-inset-top, 0));
  }

  .view-title {
    font-size: 1.25rem;
  }

  .filter-bar {
    padding: 0.5rem 0.75rem;
  }

  .filter-btn {
    padding: 0.4rem 0.7rem;
    font-size: 0.75rem;
  }

  .view-content {
    padding: 0.75rem;
  }

  .knowledge-card {
    padding: 0.85rem;
    gap: 0.75rem;
  }

  .card-icon {
    width: 36px;
    height: 36px;
  }

  .card-tags {
    gap: 0.3rem;
  }

  .tag {
    padding: 0.15rem 0.5rem;
    font-size: 0.65rem;
  }
}
</style>
