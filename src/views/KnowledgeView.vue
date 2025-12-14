<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import roomService from '@/services/roomService'
import knowledgeService from '@/services/knowledgeService'
import documentService from '@/services/documentService'
import AppIcon from '@/components/ui/AppIcon.vue'
import AppButton from '@/components/ui/AppButton.vue'

const rooms = ref([])
const selectedRoomId = ref('')
const knowledgeBase = ref(null)
const documents = ref([])
const loadingKB = ref(false)
const loadingDocs = ref(false)
const refreshing = ref(false)
const searchQuery = ref('')
/* Summary removed from top of KB (managed elsewhere) */
const newDecision = ref('')
const newLink = ref({ title: '', url: '' })
const newResource = ref({ title: '', url: '', description: '' })
const uploadingDoc = ref(false)
const uploadProgress = ref(0)
const docSearchQuery = ref('')
const docSearchResults = ref([])
const docQuestion = ref('')
const docAnswer = ref(null)
const askingDoc = ref(false)
const error = ref('')
const fileInput = ref(null)

const normalizedKB = computed(() => normalizeKB(knowledgeBase.value))

const filteredDecisions = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return normalizedKB.value.key_decisions.filter((d) => d.toLowerCase().includes(q))
})

const filteredLinks = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return normalizedKB.value.important_links.filter((l) =>
    `${l.title} ${l.url}`.toLowerCase().includes(q),
  )
})

const filteredResources = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return normalizedKB.value.resources.filter((r) =>
    `${r.title} ${r.url} ${r.description || ''}`.toLowerCase().includes(q),
  )
})

const filteredDocs = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return documents.value.filter((d) => `${d.filename} ${d.summary || ''}`.toLowerCase().includes(q))
})

const normalizeKB = (data = {}) => {
  const links = (data.important_links || []).map((l) => {
    if (typeof l === 'string') return { title: l, url: l }
    return l
  })

  return {
    summary: data.summary || '',
    key_decisions: data.key_decisions || [],
    important_links: links,
    resources: data.resources || [],
    last_updated: data.last_updated || data.updated_at || '',
    id: data.id,
    room_id: data.room_id,
  }
}

onMounted(async () => {
  await loadRooms()
})

watch(selectedRoomId, async (roomId) => {
  if (!roomId) return
  await refreshRoomData()
})

const loadRooms = async () => {
  try {
    const response = await roomService.getUserRooms()
    rooms.value = response.items || response || []
    if (rooms.value.length) {
      selectedRoomId.value = rooms.value[0].id
    }
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load rooms'
  }
}

const refreshRoomData = async () => {
  if (!selectedRoomId.value) return
  refreshing.value = true
  await Promise.all([fetchKB(), fetchDocuments()])
  refreshing.value = false
}

const fetchKB = async () => {
  if (!selectedRoomId.value) return
  try {
    loadingKB.value = true
    const kb = await knowledgeService.getRoomKB(selectedRoomId.value)
    knowledgeBase.value = normalizeKB(kb || {})
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load knowledge base'
  } finally {
    loadingKB.value = false
  }
}

const fetchDocuments = async () => {
  if (!selectedRoomId.value) return
  try {
    loadingDocs.value = true
    const docs = await documentService.getRoomDocuments(selectedRoomId.value)
    documents.value = docs || []
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to load documents'
  } finally {
    loadingDocs.value = false
  }
}

/* Summary save/generate removed from UI */

const addDecision = async () => {
  if (!newDecision.value.trim() || !selectedRoomId.value) return
  try {
    const kb = await knowledgeService.addDecision(selectedRoomId.value, newDecision.value.trim())
    knowledgeBase.value = normalizeKB(kb)
    newDecision.value = ''
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to add decision'
  }
}

const addLink = async () => {
  if (!newLink.value.url || !selectedRoomId.value) return
  try {
    const kb = await knowledgeService.addLink(selectedRoomId.value, { ...newLink.value })
    knowledgeBase.value = normalizeKB(kb)
    newLink.value = { title: '', url: '' }
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to add link'
  }
}

const addResource = async () => {
  if (!newResource.value.title || !selectedRoomId.value) return
  try {
    const kb = await knowledgeService.addResource(selectedRoomId.value, { ...newResource.value })
    knowledgeBase.value = normalizeKB(kb)
    newResource.value = { title: '', url: '', description: '' }
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to add resource'
  }
}

const handleFilePick = () => {
  fileInput.value?.click()
}

const onFileChange = async (event) => {
  const file = event.target?.files?.[0]
  if (file) {
    await uploadDocument(file)
  }
  if (event.target) event.target.value = ''
}

const uploadDocument = async (file) => {
  if (!selectedRoomId.value) return

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
  ]
  if (!allowedTypes.includes(file.type)) {
    error.value = 'Please upload a PDF or PowerPoint file.'
    return
  }

  if (file.size > 20 * 1024 * 1024) {
    error.value = 'File too large. Maximum size is 20MB.'
    return
  }

  try {
    uploadingDoc.value = true
    uploadProgress.value = 0

    const doc = await documentService.uploadDocument(selectedRoomId.value, file, (progress) => {
      uploadProgress.value = progress
    })

    // After upload, reload the document list from backend to avoid duplicates
    await fetchDocuments()
    // Link the upload into KB as a resource
    try {
      const kb = await knowledgeService.addResource(selectedRoomId.value, {
        title: doc.filename,
        url: doc.id,
        description: doc.summary || 'Uploaded document',
      })
      knowledgeBase.value = normalizeKB(kb)
    } catch (innerErr) {
      console.error('Failed to attach document to KB', innerErr)
    }
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to upload document'
  } finally {
    uploadingDoc.value = false
    uploadProgress.value = 0
  }
}

const deleteDocument = async (doc) => {
  if (!selectedRoomId.value) return
  try {
    await documentService.deleteDocument(selectedRoomId.value, doc.id)
    documents.value = documents.value.filter((d) => d.id !== doc.id)
    try {
      const kb = await knowledgeService.removeResource(selectedRoomId.value, doc.id)
      knowledgeBase.value = normalizeKB(kb)
    } catch (innerErr) {
      console.error('Failed to remove document from KB', innerErr)
    }
  } catch (err) {
    error.value = err.response?.data?.detail || 'Failed to delete document'
  }
}

const searchDocuments = async () => {
  if (!docSearchQuery.value.trim() || !selectedRoomId.value) {
    docSearchResults.value = []
    return
  }

  try {
    const results = await documentService.searchDocuments(
      selectedRoomId.value,
      docSearchQuery.value.trim(),
    )
    docSearchResults.value = results || []
  } catch (err) {
    error.value = err.response?.data?.detail || 'Search failed'
  }
}

const askDocuments = async () => {
  if (!docQuestion.value.trim() || !selectedRoomId.value) return
  try {
    askingDoc.value = true
    const response = await documentService.askDocument(selectedRoomId.value, docQuestion.value)
    docAnswer.value = { question: response.question, answer: response.answer }
  } catch (err) {
    error.value = err.response?.data?.detail || 'Document Q&A failed'
  } finally {
    askingDoc.value = false
  }
}

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

const formatFileSize = (bytes) => {
  if (!bytes && bytes !== 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unit = 0
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024
    unit++
  }
  return `${size.toFixed(1)} ${units[unit]}`
}
</script>

<template>
  <div class="knowledge-view">
    <header class="view-header">
      <div class="header-left">
        <div class="eyebrow">Knowledge · RAG</div>
        <h1>Room Knowledge Base</h1>
        <p>Upload documents, capture decisions, and ask grounded questions with RAG.</p>
      </div>
      <div class="header-actions">
        <div class="select-wrap">
          <AppIcon name="room" size="sm" />
          <select v-model="selectedRoomId">
            <option value="" disabled>Select a room</option>
            <option v-for="room in rooms" :key="room.id" :value="room.id">
              {{ room.name }}
            </option>
          </select>
        </div>
        <AppButton variant="ghost" size="sm" :disabled="refreshing" @click="refreshRoomData">
          <AppIcon name="refresh" size="sm" />
          Refresh
        </AppButton>
      </div>
    </header>

    <div class="content">
      <div class="toolbar">
        <div class="search-box">
          <AppIcon name="search" size="sm" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Filter knowledge, links, and documents"
            class="search-input"
          />
        </div>
        <div class="meta">
          <span v-if="normalizedKB.last_updated"
            >Updated {{ formatDate(normalizedKB.last_updated) }}</span
          >
          <span v-else>Fresh workspace</span>
        </div>
      </div>

      <div v-if="error" class="alert alert-error">
        <AppIcon name="alert-circle" size="sm" />
        {{ error }}
      </div>

      <div v-if="!rooms.length" class="empty">
        <div class="empty-card">
          <AppIcon name="book" size="lg" />
          <h3>No rooms yet</h3>
          <p>Create or join a room to start building a knowledge base.</p>
        </div>
      </div>

      <template v-else>
        <div class="grid">
          <!-- Summary removed from KB view -->

          <section class="card list-card">
            <header>
              <div>
                <p class="eyebrow">Decisions</p>
                <h3>Key calls</h3>
              </div>
            </header>
            <div class="list-body">
              <p v-if="loadingKB" class="muted">Loading decisions...</p>
              <p v-else-if="!filteredDecisions.length" class="muted">No decisions captured yet.</p>
              <ul v-else class="pill-list">
                <li v-for="(decision, idx) in filteredDecisions" :key="idx">
                  <AppIcon name="check-circle" size="xs" />
                  {{ decision }}
                </li>
              </ul>
            </div>
            <div class="inline-form">
              <input
                v-model="newDecision"
                type="text"
                placeholder="Add a decision"
                @keyup.enter="addDecision"
              />
              <AppButton size="sm" @click="addDecision">Add</AppButton>
            </div>
          </section>

          <section class="card list-card">
            <header>
              <div>
                <p class="eyebrow">Links</p>
                <h3>Important references</h3>
              </div>
            </header>
            <div class="list-body">
              <p v-if="loadingKB" class="muted">Loading links...</p>
              <p v-else-if="!filteredLinks.length" class="muted">No links saved yet.</p>
              <ul v-else class="link-list">
                <li v-for="(link, idx) in filteredLinks" :key="idx">
                  <a :href="link.url" target="_blank" rel="noopener">
                    <AppIcon name="link" size="xs" />
                    {{ link.title }}
                  </a>
                </li>
              </ul>
            </div>
            <div class="inline-form two-cols">
              <input v-model="newLink.title" type="text" placeholder="Link title" />
              <input v-model="newLink.url" type="url" placeholder="https://..." />
              <AppButton size="sm" class="full" @click="addLink">Save link</AppButton>
            </div>
          </section>

          <section class="card list-card">
            <header>
              <div>
                <p class="eyebrow">Resources</p>
                <h3>Artifacts</h3>
              </div>
            </header>
            <div class="list-body">
              <p v-if="loadingKB" class="muted">Loading resources...</p>
              <p v-else-if="!filteredResources.length" class="muted">No resources added yet.</p>
              <ul v-else class="resource-list">
                <li v-for="(res, idx) in filteredResources" :key="idx">
                  <div class="resource-title">
                    <AppIcon name="file" size="xs" />
                    <div>
                      <div class="strong">{{ res.title }}</div>
                      <p class="muted">{{ res.description }}</p>
                    </div>
                  </div>
                  <a v-if="res.url" :href="res.url" target="_blank" rel="noopener" class="muted">
                    {{ res.url }}
                  </a>
                </li>
              </ul>
            </div>
            <div class="inline-form two-cols">
              <input v-model="newResource.title" type="text" placeholder="Resource name" />
              <input v-model="newResource.url" type="text" placeholder="URL or id" />
              <input
                v-model="newResource.description"
                type="text"
                placeholder="Short description"
                class="full"
              />
              <AppButton size="sm" class="full" @click="addResource">Save resource</AppButton>
            </div>
          </section>
        </div>

        <div class="grid docs-grid">
          <section class="card docs-card">
            <header>
              <div>
                <p class="eyebrow">Documents</p>
                <h3>Upload & manage</h3>
              </div>
              <div class="upload-actions">
                <input
                  ref="fileInput"
                  type="file"
                  accept=".pdf,.ppt,.pptx"
                  hidden
                  @change="onFileChange"
                />
                <AppButton size="sm" variant="ghost" @click="handleFilePick">
                  <AppIcon name="upload" size="sm" />
                  Upload
                </AppButton>
              </div>
            </header>

            <div v-if="uploadingDoc" class="progress">
              <div class="progress-fill" :style="{ width: uploadProgress + '%' }"></div>
              <span>{{ uploadProgress }}%</span>
            </div>

            <div class="doc-list">
              <p v-if="loadingDocs" class="muted">Loading documents...</p>
              <p v-else-if="!filteredDocs.length" class="muted">No documents uploaded yet.</p>
              <div v-else class="doc-grid">
                <article v-for="doc in filteredDocs" :key="doc.id" class="doc-card">
                  <div class="doc-top">
                    <div class="doc-icon">
                      <AppIcon
                        :name="doc.file_type === 'pdf' ? 'file-text' : 'presentation'"
                        size="sm"
                      />
                    </div>
                    <div class="doc-meta">
                      <div class="strong">{{ doc.filename }}</div>
                      <p class="muted">
                        {{ doc.file_type.toUpperCase() }} • {{ formatFileSize(doc.file_size) }}
                      </p>
                      <p class="muted">Uploaded {{ formatDate(doc.created_at) }}</p>
                    </div>
                  </div>
                  <p class="doc-summary" v-if="doc.summary">{{ doc.summary }}</p>
                  <div class="doc-actions">
                    <span class="pill">Chunks: {{ doc.chunk_count }}</span>
                    <button class="icon-btn danger" title="Delete" @click="deleteDocument(doc)">
                      <AppIcon name="trash" size="xs" />
                    </button>
                  </div>
                </article>
              </div>
            </div>
          </section>

          <section class="card rag-card">
            <header>
              <div>
                <p class="eyebrow">Ask the documents</p>
                <h3>RAG Q&A and search</h3>
              </div>
            </header>

            <div class="inline-form">
              <input
                v-model="docSearchQuery"
                type="text"
                placeholder="Semantic search across documents"
                @keyup.enter="searchDocuments"
              />
              <AppButton size="sm" @click="searchDocuments">Search</AppButton>
            </div>
            <div class="rag-results" v-if="docSearchResults.length">
              <div v-for="(result, idx) in docSearchResults" :key="idx" class="rag-result">
                <div class="pill">Match {{ idx + 1 }}</div>
                <p class="muted">{{ result.content || result.snippet || result.message }}</p>
                <div class="pill subtle">Score {{ result.similarity ?? 'n/a' }}</div>
              </div>
            </div>

            <div class="ask-block">
              <input
                v-model="docQuestion"
                type="text"
                placeholder="Ask a question and get an answer from your docs"
                @keyup.enter="askDocuments"
              />
              <AppButton size="sm" :disabled="askingDoc" @click="askDocuments">
                <AppIcon name="sparkle" size="sm" />
                Ask
              </AppButton>
            </div>
            <div v-if="docAnswer" class="answer-card">
              <p class="eyebrow">Answer</p>
              <div class="strong">{{ docAnswer.question }}</div>
              <p>{{ docAnswer.answer }}</p>
            </div>
          </section>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.knowledge-view {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--background);
}

.view-header {
  padding: 1.75rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(16, 185, 129, 0.08));
  border-bottom: 1px solid var(--border);
}

.header-left h1 {
  margin: 0.25rem 0;
  font-size: 1.6rem;
  color: var(--text-primary);
}

.header-left p {
  margin: 0;
  color: var(--text-secondary);
}

.eyebrow {
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.select-wrap {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.35rem 0.75rem;
  background: var(--surface);
}

.select-wrap select {
  border: none;
  background: transparent;
  color: var(--text-primary);
  font-weight: 600;
}

.select-wrap select:focus {
  outline: none;
}

.content {
  padding: 1.5rem 2rem 2rem;
  flex: 1;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.search-box {
  position: relative;
  width: 380px;
  max-width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.85rem 0.85rem 0.85rem 2.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
}

.meta {
  color: var(--text-muted);
  font-weight: 600;
}

.alert {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
}

.alert-error {
  background: rgba(239, 68, 68, 0.1);
  color: #b91c1c;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.empty {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

.empty-card {
  text-align: center;
  padding: 2rem;
  border: 1px dashed var(--border);
  border-radius: 16px;
  background: var(--surface);
  color: var(--text-secondary);
  max-width: 480px;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.docs-grid {
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  margin-top: 1rem;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 1.1rem;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05);
}

.card header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.card h3 {
  margin: 0.15rem 0 0;
  font-size: 1.05rem;
}

.textarea {
  width: 100%;
  border-radius: 12px;
  border: 1px solid var(--border);
  padding: 0.85rem;
  min-height: 120px;
  background: var(--surface-elevated);
  resize: vertical;
}

.list-body {
  min-height: 80px;
}

.muted {
  color: var(--text-muted);
  margin: 0.2rem 0;
}

.pill-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pill-list li {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
}

.link-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.link-list a {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary);
  text-decoration: none;
}

.resource-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  gap: 0.5rem;
}

.resource-title {
  display: flex;
  gap: 0.6rem;
  align-items: center;
}

.strong {
  font-weight: 700;
  color: var(--text-primary);
}

.inline-form {
  display: grid;
  grid-template-columns: auto auto;
  gap: 0.5rem;
  margin-top: 0.75rem;
  align-items: center;
}

.inline-form input {
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 0.65rem 0.75rem;
  background: var(--surface-elevated);
}

.inline-form.two-cols {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.inline-form .full {
  grid-column: 1 / -1;
}

.docs-card .doc-grid {
  display: grid;
  gap: 0.75rem;
}

.doc-card {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.75rem;
  background: var(--surface-elevated);
}

.doc-top {
  display: flex;
  gap: 0.75rem;
}

.doc-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: rgba(37, 99, 235, 0.08);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
}

.doc-summary {
  margin: 0.4rem 0;
}

.doc-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pill {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  border-radius: 999px;
  background: var(--surface);
  border: 1px solid var(--border);
  font-size: 0.8rem;
}

.pill.subtle {
  background: var(--surface-elevated);
}

.rag-card .rag-results {
  display: grid;
  gap: 0.6rem;
  margin-top: 0.5rem;
}

.rag-result {
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.65rem 0.75rem;
  background: var(--surface-elevated);
}

.ask-block {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.ask-block input {
  border-radius: 10px;
  border: 1px solid var(--border);
  padding: 0.75rem;
  background: var(--surface-elevated);
}

.answer-card {
  margin-top: 0.75rem;
  padding: 0.75rem;
  border-radius: 12px;
  border: 1px solid var(--primary-muted);
  background: rgba(37, 99, 235, 0.06);
}

.progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.progress-fill {
  flex: 1;
  height: 8px;
  border-radius: 999px;
  background: var(--primary);
}

.upload-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn.danger {
  border-color: rgba(239, 68, 68, 0.25);
  color: #b91c1c;
}

@media (max-width: 768px) {
  .view-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .inline-form,
  .ask-block {
    grid-template-columns: 1fr;
  }
}
</style>
