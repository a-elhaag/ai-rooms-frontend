<script setup>
import { ref, computed } from 'vue'

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
      return '📄'
    case 'link':
      return '🔗'
    case 'note':
      return '📝'
    default:
      return '📁'
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
        <button class="btn btn-primary btn-new" @click="showCreateModal = true">
          <span class="btn-icon-circle">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </span>
          <span>Add Knowledge</span>
        </button>
      </div>
    </header>

    <!-- Search & Filter Bar -->
    <div class="filter-bar">
      <div class="search-box">
        <svg viewBox="0 0 24 24" class="search-icon" aria-hidden="true">
          <circle cx="11" cy="11" r="6" />
          <line x1="15.5" y1="15.5" x2="20" y2="20" />
        </svg>
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
          📄 Documents
        </button>
        <button
          class="filter-btn"
          :class="{ active: selectedType === 'link' }"
          @click="selectedType = 'link'"
        >
          🔗 Links
        </button>
        <button
          class="filter-btn"
          :class="{ active: selectedType === 'note' }"
          @click="selectedType = 'note'"
        >
          📝 Notes
        </button>
      </div>
    </div>

    <!-- Knowledge Content -->
    <div class="view-content">
      <div v-if="filteredKnowledge.length === 0" class="empty-state">
        <div class="empty-illustration">
          <div class="empty-icon-wrap">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8 7h8" />
              <path d="M8 11h6" />
            </svg>
          </div>
        </div>
        <h3>No knowledge found</h3>
        <p>Add documents, links, or notes to build your knowledge base</p>
        <button class="btn btn-primary" @click="showCreateModal = true">Add Knowledge</button>
      </div>

      <div v-else class="knowledge-grid">
        <article v-for="item in filteredKnowledge" :key="item.id" class="knowledge-card">
          <div class="card-icon">{{ getTypeIcon(item.type) }}</div>

          <div class="card-content">
            <h3 class="card-title">{{ item.title }}</h3>
            <div class="card-meta">
              <span class="card-room">
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="14" rx="2" />
                  <path d="M7 9h10" />
                </svg>
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
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
            <button class="icon-btn" title="More">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
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

.filter-bar {
  padding: 1rem 2rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  border-bottom: 1px solid #f3f4f6;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 999px;
  flex: 1;
  max-width: 320px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.search-icon {
  width: 16px;
  height: 16px;
  stroke: #9ca3af;
  fill: none;
  stroke-width: 2;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
  color: #0f172a;
  background: transparent;
}

.search-input::placeholder {
  color: #9ca3af;
}

.type-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 999px;
  font-size: 0.8rem;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover {
  border-color: #bfdbfe;
  color: #2563eb;
}

.filter-btn.active {
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-color: #2563eb;
  color: #2563eb;
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
  background: white;
  border: 1px solid #e5e7eb;
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
  border-color: #bfdbfe;
  box-shadow: 0 12px 32px rgba(37, 99, 235, 0.1);
  transform: translateY(-3px);
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #eff6ff, #dbeafe);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 0.5rem;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
  color: #6b7280;
  margin-bottom: 0.75rem;
}

.card-room {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.card-room svg {
  width: 14px;
  height: 14px;
  stroke: currentColor;
  fill: none;
  stroke-width: 1.6;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.tag {
  padding: 0.2rem 0.6rem;
  background: #f3f4f6;
  border-radius: 999px;
  font-size: 0.7rem;
  color: #6b7280;
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
  fill: none;
  stroke-width: 2;
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

  .filter-bar {
    padding: 0.75rem 1.25rem;
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    max-width: none;
  }

  .type-filters {
    overflow-x: auto;
    padding-bottom: 0.25rem;
  }

  .view-content {
    padding: 1rem 1.25rem 1.5rem;
  }

  .knowledge-grid {
    grid-template-columns: 1fr;
  }
}
</style>
