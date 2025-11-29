<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import roomService from '@/services/roomService'
import AppIcon from '@/components/ui/AppIcon.vue'

const router = useRouter()
const rooms = ref([])
const loading = ref(true)
const error = ref(null)
const filter = ref('')
const showCreateModal = ref(false)
const showJoinModal = ref(false)
const newRoomName = ref('')
const joinCode = ref('')
const newRoomLoading = ref(false)
const joinRoomLoading = ref(false)
const joinError = ref('')

// Filtered rooms based on search
const filteredRooms = computed(() => {
  if (!filter.value.trim()) return rooms.value
  const searchTerm = filter.value.toLowerCase()
  return rooms.value.filter((room) => room.name.toLowerCase().includes(searchTerm))
})

// Fetch all rooms
const fetchRooms = async () => {
  try {
    loading.value = true
    error.value = null
    const response = await roomService.getUserRooms()
    rooms.value = response.items || response || []
  } catch (err) {
    console.error('Failed to fetch rooms:', err)
    error.value = err.response?.data?.detail || 'Failed to load rooms'
  } finally {
    loading.value = false
  }
}

// Create a new room
const createRoom = async () => {
  if (!newRoomName.value.trim() || newRoomLoading.value) return

  try {
    newRoomLoading.value = true
    const newRoom = await roomService.createRoom({
      name: newRoomName.value.trim(),
    })
    rooms.value.unshift(newRoom)
    showCreateModal.value = false
    newRoomName.value = ''
    router.push(`/room/${newRoom.id}`)
  } catch (err) {
    console.error('Failed to create room:', err)
    error.value = err.response?.data?.detail || 'Failed to create room'
  } finally {
    newRoomLoading.value = false
  }
}

// Join a room with code
const joinRoom = async () => {
  if (!joinCode.value.trim() || joinRoomLoading.value) return

  try {
    joinRoomLoading.value = true
    joinError.value = ''
    const room = await roomService.joinRoom({
      join_code: joinCode.value.trim().toUpperCase(),
    })
    rooms.value.unshift(room)
    showJoinModal.value = false
    joinCode.value = ''
    router.push(`/room/${room.id}`)
  } catch (err) {
    console.error('Failed to join room:', err)
    joinError.value = err.response?.data?.detail || 'Invalid room code'
  } finally {
    joinRoomLoading.value = false
  }
}

// Copy room code to clipboard
const copyRoomCode = async (code) => {
  try {
    await navigator.clipboard.writeText(code)
    alert('Room code copied!')
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}

// Navigate to room
const openRoom = (roomId) => {
  router.push(`/room/${roomId}`)
}

// Get room initials
const getRoomInitials = (name) => {
  if (!name) return 'R'
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return date.toLocaleDateString()
}

onMounted(() => {
  fetchRooms()
})
</script>

<template>
  <div class="home-shell">
    <!-- Top bar -->
    <header class="top-bar">
      <div class="top-bar-left">
        <div class="brand-mark">
          <div class="brand-icon">
            <AppIcon name="monitor" size="md" />
          </div>
          <div>
            <div class="brand-title">AI Rooms</div>
            <div class="brand-tagline">Lightweight spaces for AI collaboration</div>
          </div>
        </div>
      </div>

      <div class="top-bar-right">
        <div class="search-shell">
          <span class="search-icon">
            <AppIcon name="search" size="sm" />
          </span>
          <input
            v-model="filter"
            class="search-input"
            type="text"
            placeholder="Search rooms by name"
          />
        </div>

        <button class="btn btn-secondary btn-join" @click="showJoinModal = true">
          <AppIcon name="user" size="xs" />
          <span>Join Room</span>
        </button>

        <button class="btn btn-primary btn-new" @click="showCreateModal = true">
          <span class="btn-icon-circle">
            <AppIcon name="plus" size="xs" />
          </span>
          <span>New Room</span>
        </button>
      </div>
    </header>

    <!-- Main content area -->
    <main class="home-main">
      <section class="summary-row">
        <div class="summary-card">
          <div class="summary-header">
            <span class="summary-icon">
              <AppIcon name="room" size="md" />
            </span>
            <div>
              <div class="summary-label">Total Rooms</div>
              <div class="summary-value">{{ rooms.length }}</div>
            </div>
          </div>
        </div>

        <div class="summary-card ghost" v-if="!loading && rooms.length">
          <div class="summary-header">
            <span class="summary-icon">
              <AppIcon name="clock" size="md" />
            </span>
            <div>
              <div class="summary-label">Recently Active</div>
              <div class="summary-sub">Sorted by last update</div>
            </div>
          </div>
        </div>
      </section>

      <!-- Loading -->
      <div v-if="loading" class="state state-loading">
        <div class="loader-ring"></div>
        <p>Loading your rooms…</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="state state-error">
        <div class="state-icon state-icon-error">
          <AppIcon name="alert" size="lg" />
        </div>
        <p>{{ error }}</p>
        <button class="btn btn-secondary" @click="fetchRooms">Retry</button>
      </div>

      <!-- Empty -->
      <div v-else-if="filteredRooms.length === 0" class="state state-empty">
        <div class="illustration">
          <div class="illustration-orbit">
            <div class="illustration-core">
              <AppIcon name="box" size="lg" />
            </div>
          </div>
        </div>
        <template v-if="rooms.length === 0">
          <h2>No rooms yet</h2>
          <p>Create your first room to start working with AI in a focused space.</p>
          <button class="btn btn-primary" @click="showCreateModal = true">
            <span class="btn-icon-circle">
              <AppIcon name="plus" size="xs" />
            </span>
            <span>Create your first room</span>
          </button>
        </template>
        <template v-else>
          <h2>No matching rooms</h2>
          <p>Try a different search term.</p>
        </template>
      </div>

      <!-- Rooms grid -->
      <section v-else class="rooms-section">
        <header class="rooms-header">
          <h2>Rooms</h2>
          <span class="rooms-sub">Click a card to jump into a room</span>
        </header>

        <div class="rooms-grid">
          <article
            v-for="room in filteredRooms"
            :key="room.id"
            class="room-card-light"
            @click="openRoom(room.id)"
          >
            <div class="room-card-main">
              <div class="room-avatar-light">
                {{ getRoomInitials(room.name) }}
              </div>
              <div class="room-meta-main">
                <div class="room-title-row">
                  <h3 class="room-title">{{ room.name }}</h3>
                  <span class="room-pill" v-if="room.has_ai">
                    <AppIcon name="bot" size="xs" />
                    <span>AI</span>
                  </span>
                </div>
                <p class="room-desc">
                  {{ room.description || 'No description yet' }}
                </p>
                <div class="room-code" @click.stop="copyRoomCode(room.join_code)">
                  <span class="room-code-label">Code:</span>
                  <span class="room-code-value">{{ room.join_code }}</span>
                  <AppIcon name="clipboard" size="xs" />
                </div>
              </div>
            </div>

            <div class="room-card-footer-light">
              <div class="room-stats">
                <span class="room-stat">
                  <AppIcon name="user" size="xs" />
                  <span>{{ room.member_count || 1 }}</span>
                </span>
                <span class="room-stat">
                  <AppIcon name="room" size="xs" />
                  <span>{{ room.message_count || 0 }}</span>
                </span>
              </div>

              <div class="room-time-link">
                <span class="room-time-text">
                  Updated {{ formatDate(room.updated_at || room.created_at) }}
                </span>
                <span class="room-open-icon">
                  <AppIcon name="chevron-right" size="xs" />
                </span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </main>

    <!-- Create Room Modal -->
    <div v-if="showCreateModal" class="overlay" @click.self="showCreateModal = false">
      <div class="modal-light">
        <header class="modal-header-light">
          <div>
            <h2>Create a new room</h2>
            <p>Name the space where you and AI will work together.</p>
          </div>
          <button class="icon-button" @click="showCreateModal = false" aria-label="Close">
            <AppIcon name="x" size="sm" />
          </button>
        </header>

        <section class="modal-body-light">
          <label class="field">
            <span class="field-label">Room name</span>
            <input
              id="room-name"
              v-model="newRoomName"
              type="text"
              class="field-input"
              placeholder="e.g. Product planning, Code review, Research"
              @keyup.enter="createRoom"
              :maxlength="100"
              autofocus
            />
            <div class="field-meta">
              <span>Keep it short and descriptive.</span>
              <span>{{ newRoomName.length }}/100</span>
            </div>
          </label>
        </section>

        <footer class="modal-footer-light">
          <button class="btn btn-secondary" @click="showCreateModal = false">Cancel</button>
          <button
            class="btn btn-primary"
            @click="createRoom"
            :disabled="!newRoomName.trim() || newRoomLoading"
          >
            <span v-if="newRoomLoading" class="loader-inline"></span>
            <span v-else>Create room</span>
          </button>
        </footer>
      </div>
    </div>

    <!-- Join Room Modal -->
    <div v-if="showJoinModal" class="overlay" @click.self="showJoinModal = false">
      <div class="modal-light">
        <header class="modal-header-light">
          <div>
            <h2>Join a room</h2>
            <p>Enter the room code to join an existing room.</p>
          </div>
          <button class="icon-button" @click="showJoinModal = false" aria-label="Close">
            <AppIcon name="x" size="sm" />
          </button>
        </header>

        <section class="modal-body-light">
          <label class="field">
            <span class="field-label">Room code</span>
            <input
              id="join-code"
              v-model="joinCode"
              type="text"
              class="field-input"
              placeholder="e.g. A1B2C3D4"
              @keyup.enter="joinRoom"
              :maxlength="10"
              autofocus
              style="text-transform: uppercase"
            />
            <div class="field-meta">
              <span>Ask the room owner for the code.</span>
            </div>
          </label>
          <div v-if="joinError" class="error-message">
            {{ joinError }}
          </div>
        </section>

        <footer class="modal-footer-light">
          <button class="btn btn-secondary" @click="showJoinModal = false">Cancel</button>
          <button
            class="btn btn-primary"
            @click="joinRoom"
            :disabled="!joinCode.trim() || joinRoomLoading"
          >
            <span v-if="joinRoomLoading" class="loader-inline"></span>
            <span v-else>Join room</span>
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-shell {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: radial-gradient(circle at top, #eef4ff 0, #f9fafb 45%, #ffffff 100%);
  color: #0f172a;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 2.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: saturate(180%) blur(12px);
}

.brand-mark {
  display: flex;
  align-items: center;
  gap: 0.9rem;
}

.brand-icon {
  width: 36px;
  height: 36px;
  border-radius: 14px;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 12px 30px rgba(37, 99, 235, 0.35);
  color: white;
}

.brand-title {
  font-size: 1.1rem;
  font-weight: 600;
}

.brand-tagline {
  font-size: 0.8rem;
  color: #6b7280;
}

.top-bar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.search-shell {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  border-radius: 999px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}

.search-icon {
  color: #9ca3af;
  display: flex;
  align-items: center;
}

.search-input {
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.85rem;
  color: #111827;
}

.search-input::placeholder {
  color: #9ca3af;
}

.btn-new {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding-inline: 1.1rem;
}

.btn-icon-circle {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #eff6ff;
}

.home-main {
  flex: 1;
  padding: 1.5rem 2.5rem 2rem;
  overflow: auto;
}

.summary-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.summary-card {
  min-width: 220px;
  padding: 0.9rem 1rem;
  border-radius: 1rem;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.04);
}

.summary-card.ghost {
  opacity: 0.85;
}

.summary-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.summary-icon {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #eff6ff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2563eb;
}

.summary-label {
  font-size: 0.75rem;
  color: #6b7280;
}

.summary-value {
  font-size: 1.1rem;
  font-weight: 600;
}

.summary-sub {
  font-size: 0.75rem;
  color: #9ca3af;
}

.state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 380px;
  gap: 0.8rem;
  color: #4b5563;
}

.state-empty h2 {
  font-size: 1.3rem;
  margin-top: 1rem;
}

.state-empty p {
  max-width: 420px;
  text-align: center;
  font-size: 0.9rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.state-error p {
  margin-bottom: 0.75rem;
}

.state-icon {
  width: 60px;
  height: 60px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.state-icon-error {
  background: #fef2f2;
  color: #dc2626;
}

.loader-ring {
  width: 30px;
  height: 30px;
  border-radius: 999px;
  border: 3px solid #e5e7eb;
  border-top-color: #2563eb;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.illustration {
  width: 140px;
  height: 140px;
  border-radius: 999px;
  background: radial-gradient(circle at 30% 20%, #bfdbfe, #eff6ff 50%, #ffffff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 50px rgba(37, 99, 235, 0.25);
}

.illustration-orbit {
  width: 78px;
  height: 78px;
  border-radius: 999px;
  border: 1px dashed rgba(37, 99, 235, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
}

.illustration-core {
  width: 46px;
  height: 46px;
  border-radius: 18px;
  background: linear-gradient(135deg, #2563eb, #60a5fa);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #eff6ff;
}

.rooms-section {
  margin-top: 0.5rem;
}

.rooms-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 0.9rem;
}

.rooms-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
}

.rooms-sub {
  font-size: 0.8rem;
  color: #9ca3af;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1rem;
}

.room-card-light {
  background: #ffffff;
  border-radius: 1.1rem;
  border: 1px solid #e5e7eb;
  padding: 0.95rem 1rem 0.85rem;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
  box-shadow: 0 10px 25px rgba(15, 23, 42, 0.03);
}

.room-card-light:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.08);
  border-color: #bfdbfe;
}

.room-card-main {
  display: flex;
  gap: 0.75rem;
}

.room-avatar-light {
  width: 46px;
  height: 46px;
  border-radius: 15px;
  background: linear-gradient(135deg, #dbeafe, #60a5fa);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1rem;
  color: #1d4ed8;
}

.room-meta-main {
  flex: 1;
  min-width: 0;
}

.room-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.room-title {
  font-size: 0.98rem;
  font-weight: 600;
}

.room-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.1rem 0.55rem;
  border-radius: 999px;
  background: #eff6ff;
  color: #1d4ed8;
  font-size: 0.75rem;
}

.room-desc {
  margin-top: 0.1rem;
  font-size: 0.8rem;
  color: #6b7280;
  max-height: 2.4em;
  overflow: hidden;
  text-overflow: ellipsis;
}

.room-card-footer-light {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.room-stats {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.room-stat {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  font-size: 0.78rem;
  color: #6b7280;
}

.room-time-link {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.78rem;
  color: #9ca3af;
}

.room-open-icon {
  color: #9ca3af;
  display: flex;
  align-items: center;
  transition: transform 0.16s ease;
}

.room-card-light:hover .room-open-icon {
  transform: translate(1px, -1px);
}

.overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 40;
}

.modal-light {
  width: 100%;
  max-width: 440px;
  background: #ffffff;
  border-radius: 1.2rem;
  border: 1px solid #e5e7eb;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.16);
  overflow: hidden;
}

.modal-header-light {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 1rem 1.3rem 0.8rem;
}

.modal-header-light h2 {
  font-size: 1.05rem;
  font-weight: 600;
}

.modal-header-light p {
  font-size: 0.8rem;
  color: #6b7280;
}

.icon-button {
  border: none;
  background: transparent;
  border-radius: 999px;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
  color: #9ca3af;
}

.icon-button:hover {
  background: #f3f4f6;
  transform: rotate(5deg);
}

.modal-body-light {
  padding: 0.3rem 1.3rem 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-label {
  font-size: 0.8rem;
  font-weight: 500;
}

.field-input {
  border-radius: 0.8rem;
  border: 1px solid #e5e7eb;
  padding: 0.55rem 0.8rem;
  font-size: 0.9rem;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.field-input::placeholder {
  color: #9ca3af;
}

.field-input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 1px #2563eb33;
}

.field-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.75rem;
  color: #9ca3af;
}

.modal-footer-light {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 0.6rem 1.3rem 0.9rem;
  border-top: 1px solid #f3f4f6;
}

.loader-inline {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid #eff6ff;
  border-top-color: #2563eb;
  animation: spin 0.6s linear infinite;
}

.btn-join {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
}

.room-code {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: 0.4rem;
  padding: 0.2rem 0.5rem;
  background: #f3f4f6;
  border-radius: 6px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: background 0.15s ease;
}

.room-code:hover {
  background: #e5e7eb;
}

.room-code-label {
  color: #6b7280;
}

.room-code-value {
  font-weight: 600;
  color: #2563eb;
  font-family: monospace;
}

.error-message {
  margin-top: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.85rem;
}

@media (max-width: 768px) {
  .top-bar {
    padding: 0.9rem 1rem;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .top-bar-left {
    margin-bottom: 0.25rem;
  }

  .brand-tagline {
    display: none;
  }

  .top-bar-right {
    flex-direction: column;
    gap: 0.5rem;
  }

  .search-shell {
    width: 100%;
    padding: 0.5rem 1rem;
  }

  .search-input {
    width: 100%;
    font-size: 16px; /* Prevent iOS zoom */
  }

  .btn-join,
  .btn-new {
    width: 100%;
    justify-content: center;
    padding: 0.65rem 1rem;
    min-height: 44px; /* Touch-friendly */
  }

  .home-main {
    padding: 1rem;
    padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0));
  }

  .summary-row {
    flex-direction: column;
  }

  .summary-card {
    min-width: auto;
    width: 100%;
  }

  .rooms-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .room-card-light {
    padding: 0.85rem;
  }

  .room-avatar-light {
    width: 40px;
    height: 40px;
    font-size: 0.9rem;
  }

  .modal-light {
    margin: 1rem;
    max-width: calc(100% - 2rem);
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }

  .field-input {
    font-size: 16px; /* Prevent iOS zoom */
  }
}

@media (max-width: 480px) {
  .brand-title {
    font-size: 1rem;
  }

  .brand-icon {
    width: 32px;
    height: 32px;
  }

  .illustration {
    width: 100px;
    height: 100px;
  }

  .illustration-orbit {
    width: 60px;
    height: 60px;
  }

  .illustration-core {
    width: 36px;
    height: 36px;
  }

  .state-empty h2 {
    font-size: 1.1rem;
  }

  .state-empty p {
    font-size: 0.85rem;
  }
}
</style>
