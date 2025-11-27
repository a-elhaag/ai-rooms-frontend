<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import roomService from '@/services/roomService'

const route = useRoute()
const roomId = ref(route.params.id)

const room = ref(null)
const messages = ref([])
const tasks = ref([])
const loading = ref(true)
const error = ref(null)
const messageInput = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
const activePanel = ref('chat') // chat, tasks, knowledge

// WebSocket connection
let ws = null

// Fetch room details
const fetchRoom = async () => {
  try {
    loading.value = true
    error.value = null

    // Fetch room messages
    const messagesResponse = await roomService.getRoomMessages(roomId.value, { limit: 50 })
    messages.value = (messagesResponse.items || messagesResponse || []).reverse()

    // TODO: Fetch room details and tasks when endpoints are available
    room.value = {
      id: roomId.value,
      name: 'AI Room',
      description: 'Collaborate with AI',
    }
  } catch (err) {
    console.error('Failed to fetch room:', err)
    error.value = err.response?.data?.detail || 'Failed to load room'
  } finally {
    loading.value = false
  }
}

// Send message
const sendMessage = async () => {
  if (!messageInput.value.trim() || sending.value) return

  const content = messageInput.value.trim()
  messageInput.value = ''

  try {
    sending.value = true
    const newMessage = await roomService.sendMessage(roomId.value, {
      content,
      type: 'text',
    })

    messages.value.push(newMessage)
    await nextTick()
    scrollToBottom()
  } catch (err) {
    console.error('Failed to send message:', err)
    messageInput.value = content // Restore message
  } finally {
    sending.value = false
  }
}

// Connect to WebSocket
const connectWebSocket = () => {
  try {
    const wsUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000'
    ws = new WebSocket(`${wsUrl}/ws/rooms/${roomId.value}`)

    ws.onopen = () => {
      console.log('WebSocket connected')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'message') {
          messages.value.push(data.message)
          nextTick(() => scrollToBottom())
        }
      } catch (err) {
        console.error('WebSocket message error:', err)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (roomId.value) connectWebSocket()
      }, 3000)
    }
  } catch (err) {
    console.error('Failed to connect WebSocket:', err)
  }
}

// Scroll to bottom of messages
const scrollToBottom = () => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

// Get message sender initials
const getSenderInitials = (sender) => {
  if (!sender) return 'AI'
  return sender
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// Format message time
const formatTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
}

// Get message type class
const getMessageClass = (message) => {
  if (message.sender_type === 'ai' || message.type === 'ai') {
    return 'message-ai'
  } else if (message.sender_type === 'system' || message.type === 'system') {
    return 'message-system'
  }
  return 'message-human'
}

onMounted(() => {
  fetchRoom()
  connectWebSocket()
  nextTick(() => scrollToBottom())
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
})
</script>

<template>
  <div class="room-view">
    <!-- Top Bar -->
    <div class="room-header">
      <div class="room-header-info">
        <div class="room-avatar-sm">
          {{ room ? getSenderInitials(room.name) : 'R' }}
        </div>
        <div>
          <h2 class="room-title">{{ room?.name || 'Loading...' }}</h2>
          <div class="room-status-bar">
            <span class="status-dot status-active"></span>
            <span class="status-text">AI Active</span>
          </div>
        </div>
      </div>

      <div class="room-header-actions">
        <button class="btn btn-ghost btn-sm">Members</button>
        <button class="btn btn-ghost btn-sm">Settings</button>
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="room-content">
      <!-- Chat Panel -->
      <div class="chat-panel">
        <!-- Loading state -->
        <div v-if="loading" class="loading-state">
          <div class="spinner"></div>
          <p>Loading room...</p>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="error-state">
          <span class="error-icon">⚠️</span>
          <p>{{ error }}</p>
          <button class="btn btn-secondary" @click="fetchRoom">Retry</button>
        </div>

        <!-- Messages -->
        <div v-else class="messages-container" ref="messagesContainer">
          <div v-if="messages.length === 0" class="empty-messages">
            <div class="empty-icon"></div>
            <h3>Start the conversation</h3>
            <p>Send a message or ask the AI for help</p>
          </div>

          <div
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="getMessageClass(message)"
          >
            <div class="message-avatar">
              {{ getSenderInitials(message.sender || 'AI') }}
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">
                  {{ message.sender || (message.sender_type === 'ai' ? 'AI Assistant' : 'User') }}
                </span>
                <span class="message-time">{{ formatTime(message.created_at) }}</span>
              </div>
              <div class="message-body">
                {{ message.content }}
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="message-input-container">
          <div class="message-input-wrapper glass-panel">
            <input
              v-model="messageInput"
              type="text"
              class="message-input"
              placeholder="Ask AI anything or send a message..."
              @keyup.enter="sendMessage"
              :disabled="sending"
              maxlength="2000"
            />
            <button
              class="btn btn-primary send-btn btn-glow"
              @click="sendMessage"
              :disabled="!messageInput.trim() || sending"
            >
              <span v-if="sending" class="spinner spinner-sm"></span>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Side Panel -->
      <div class="side-panel">
        <div class="panel-tabs">
          <button
            class="panel-tab"
            :class="{ active: activePanel === 'chat' }"
            @click="activePanel = 'chat'"
          >
            Chat
          </button>
          <button
            class="panel-tab"
            :class="{ active: activePanel === 'tasks' }"
            @click="activePanel = 'tasks'"
          >
            Tasks
          </button>
          <button
            class="panel-tab"
            :class="{ active: activePanel === 'knowledge' }"
            @click="activePanel = 'knowledge'"
          >
            KB
          </button>
        </div>

        <div class="panel-content">
          <!-- Tasks Panel -->
          <div v-if="activePanel === 'tasks'" class="tasks-panel">
            <div class="panel-header">
              <h3>Room Tasks</h3>
              <button class="btn btn-ghost btn-sm">+ Add</button>
            </div>

            <div class="empty-panel">
              <div class="empty-icon"></div>
              <p>No tasks yet</p>
            </div>
          </div>

          <!-- Knowledge Panel -->
          <div v-if="activePanel === 'knowledge'" class="knowledge-panel">
            <div class="panel-header">
              <h3>Knowledge Base</h3>
              <button class="btn btn-ghost btn-sm">+ Add</button>
            </div>

            <div class="empty-panel">
              <div class="empty-icon"></div>
              <p>No knowledge items yet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.room-view {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--background);
}

/* Room Header */
.room-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border);
  background: var(--surface-elevated);
  flex-shrink: 0;
  animation: slideInDown 0.3s ease;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.room-header-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.room-avatar-sm {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, var(--primary), var(--primary-soft));
  border-radius: var(--radius-xl);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.9rem;
  color: white;
  box-shadow: 0 6px 16px rgba(37, 99, 235, 0.25);
}

.room-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.room-status-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.status-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.room-header-actions {
  display: flex;
  gap: var(--space-2);
}

/* Room Content */
.room-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* Chat Panel */
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: linear-gradient(180deg, var(--background) 0%, var(--surface) 100%);
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.empty-messages {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--space-3);
  animation: fadeIn 0.4s ease;
}

.empty-messages .empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primary-muted), var(--accent-muted));
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.empty-messages h3 {
  font-size: 1.25rem;
  color: var(--text-primary);
}

.empty-messages p {
  color: var(--text-muted);
}

/* Messages */
.message {
  display: flex;
  gap: var(--space-3);
  animation: messageSlideIn 0.3s ease;
  opacity: 0;
  animation-fill-mode: forwards;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message:nth-child(1) {
  animation-delay: 0s;
}
.message:nth-child(2) {
  animation-delay: 0.05s;
}
.message:nth-child(3) {
  animation-delay: 0.1s;
}
.message:nth-child(4) {
  animation-delay: 0.15s;
}
.message:nth-child(5) {
  animation-delay: 0.2s;
}

.message-avatar {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.8rem;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.message:hover .message-avatar {
  transform: scale(1.05);
}

.message-human .message-avatar {
  background: linear-gradient(135deg, var(--human-message-bg), rgba(37, 99, 235, 0.15));
  color: var(--human-message);
  border: 2px solid var(--human-message);
}

.message-ai .message-avatar {
  background: linear-gradient(135deg, var(--ai-message-bg), rgba(139, 92, 246, 0.15));
  color: var(--ai-message);
  border: 2px solid var(--ai-message);
}

.message-system .message-avatar {
  background: var(--system-message-bg);
  color: var(--system-message);
  border: 2px solid var(--system-message);
}

.message-content {
  flex: 1;
  min-width: 0;
}

.message-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.message-sender {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.message-ai .message-sender {
  color: var(--ai-message);
}

.message-human .message-sender {
  color: var(--human-message);
}

.message-time {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.message-body {
  background: var(--surface-elevated);
  padding: var(--space-4);
  border-radius: var(--radius-xl);
  color: var(--text-secondary);
  line-height: 1.6;
  border: 1px solid var(--border);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.message:hover .message-body {
  border-color: var(--primary-muted);
  box-shadow: var(--shadow-md);
}

.message-ai .message-body {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.05), rgba(139, 92, 246, 0.02));
  border-color: rgba(139, 92, 246, 0.2);
}

.message-human .message-body {
  background: linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(37, 99, 235, 0.02));
  border-color: rgba(37, 99, 235, 0.2);
}

/* Message Input */
.message-input-container {
  padding: var(--space-4) var(--space-6);
  background: var(--surface-elevated);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.message-input-wrapper {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  padding: var(--space-3);
  border-radius: var(--radius-xl);
  background: var(--background);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.message-input-wrapper:focus-within {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-muted);
}

.message-input {
  flex: 1;
  padding: var(--space-3) var(--space-4);
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.9rem;
}

.message-input:focus {
  outline: none;
}

.message-input::placeholder {
  color: var(--text-muted);
}

.send-btn {
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: var(--radius-full);
  background: linear-gradient(135deg, var(--primary), var(--primary-soft));
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-2px) scale(1.05);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.35);
}

.send-btn:active:not(:disabled) {
  transform: translateY(0) scale(1);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.send-btn svg {
  transition: transform 0.2s ease;
}

.send-btn:hover:not(:disabled) svg {
  transform: translateX(2px);
}

/* Side Panel */
.side-panel {
  width: 340px;
  border-left: 1px solid var(--border);
  background: var(--surface-elevated);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  animation: slideInRight 0.3s ease;
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.panel-tabs {
  display: flex;
  border-bottom: 1px solid var(--border);
  background: var(--background);
}

.panel-tab {
  flex: 1;
  padding: var(--space-3);
  background: transparent;
  border: none;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  position: relative;
}

.panel-tab:hover {
  color: var(--text-primary);
  background: var(--surface);
}

.panel-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: var(--surface-elevated);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-4);
}

.panel-header h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-panel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-10) var(--space-4);
  gap: var(--space-3);
  animation: fadeIn 0.3s ease;
}

.empty-panel .empty-icon {
  width: 60px;
  height: 60px;
  background: var(--surface);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-panel p {
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* States */
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: var(--space-4);
  animation: fadeIn 0.3s ease;
}

.loading-state .spinner {
  width: 32px;
  height: 32px;
}

.error-state {
  color: var(--error);
}

.error-icon {
  font-size: 2rem;
}

/* Responsive */
@media (max-width: 1024px) {
  .side-panel {
    display: none;
  }
}

@media (max-width: 768px) {
  .room-header {
    padding: var(--space-3) var(--space-4);
  }

  .messages-container {
    padding: var(--space-4);
  }

  .message-input-container {
    padding: var(--space-3) var(--space-4);
  }
}
</style>
