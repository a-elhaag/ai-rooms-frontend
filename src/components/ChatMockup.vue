<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="chat-info">
        <h2>{{ roomName }}</h2>
        <span class="status-indicator online">
          <span class="status-dot"></span>
          Active
        </span>
      </div>
      <div class="chat-actions">
        <button class="icon-btn" title="Search messages">
          <AppIcon name="search" size="sm" />
        </button>
        <button class="icon-btn" title="Room settings">
          <AppIcon name="settings" size="sm" />
        </button>
      </div>
    </div>

    <div class="messages-area" ref="messagesContainer">
      <div class="date-separator">
        <span>Today</span>
      </div>

      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', message.isAi ? 'ai-message' : 'user-message']"
      >
        <div class="message-avatar">
          <AppIcon :name="message.isAi ? 'bot' : 'user'" size="md" />
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="sender-name">{{ message.sender }}</span>
            <span class="message-time">{{ message.time }}</span>
          </div>
          <div class="message-text" v-html="formatMessage(message.text)"></div>
        </div>
      </div>

      <div v-if="isTyping" class="typing-indicator">
        <div class="message ai-message">
          <div class="message-avatar">
            <AppIcon name="bot" size="md" />
          </div>
          <div class="message-content">
            <div class="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="input-area">
      <div class="input-tools">
        <button class="tool-btn" title="Attach file">
          <AppIcon name="paperclip" size="sm" />
        </button>
        <button class="tool-btn" title="Voice message">
          <AppIcon name="mic" size="sm" />
        </button>
      </div>
      <div class="input-wrapper">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="Type your message..."
          :disabled="isTyping"
        />
        <button @click="sendMessage" class="send-btn" :disabled="!newMessage.trim() || isTyping">
          <AppIcon name="send" size="md" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

defineProps({
  roomName: {
    type: String,
    default: 'AI Room',
  },
})

const messagesContainer = ref(null)
const newMessage = ref('')
const isTyping = ref(false)

const messages = ref([
  {
    id: 1,
    sender: 'Veya',
    text: "Hey! 👋 Welcome to AI Rooms. I'm Veya, your AI teammate. I can help with tasks, answer questions, and keep things organized. What are you working on?",
    time: '10:30 AM',
    isAi: true,
  },
  {
    id: 2,
    sender: 'You',
    text: 'Hi! Can you help me understand how this collaboration works?',
    time: '10:31 AM',
    isAi: false,
  },
  {
    id: 3,
    sender: 'Veya',
    text: "Of course! Here's the gist:\n\n• **Tasks**: Create and assign tasks - I'll help track them!\n• **Knowledge Base**: Share docs and I'll learn from them\n• **Real-time Chat**: Talk with your team and me anytime\n• **Proactive Help**: I'll create tasks, react to messages, and jump in when I can help 🚀",
    time: '10:32 AM',
    isAi: true,
  },
  {
    id: 4,
    sender: 'You',
    text: 'That sounds great! Can you analyze my project files?',
    time: '10:33 AM',
    isAi: false,
  },
  {
    id: 5,
    sender: 'Veya',
    text: "Absolutely! Just drop your files using the paperclip button 📎 and I'll dive in. I can do:\n\n• Code reviews and suggestions\n• Doc summaries\n• Extract tasks automatically\n• Quality recommendations\n\nLet's do this! 💪",
    time: '10:34 AM',
    isAi: true,
  },
])

const aiResponses = [
  "That's a great question! 🤔 Let me think...\n\nI'd suggest breaking this into smaller tasks. Want me to create a task list for you?",
  "On it! Here's my take:\n\n• First, let's check the current status\n• Then, spot any blockers\n• Finally, make an action plan\n\nSound good? 👍",
  "Interesting! Here's what I found:\n\n**Key Insights:**\n- Looking positive overall 📈\n- A few spots to improve\n- Core objectives are clear\n\nLet me know if you want me to dig deeper!",
  'Give me a sec to process this...\n\n✅ Done! Main takeaways:\n1. Strong foundation\n2. Room to optimize\n3. Clear path forward\n\nI added a task to track this!',
  "Love it! Let's make it happen 🚀\n\n**Next Steps:**\n• Define objectives\n• Set up workflow\n• Monitor progress\n\nI'm here to help!",
]

function formatMessage(text) {
  // Simple markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/• /g, '&bull; ')
}

async function sendMessage() {
  if (!newMessage.value.trim()) return

  const userMessage = {
    id: Date.now(),
    sender: 'You',
    text: newMessage.value,
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    isAi: false,
  }

  messages.value.push(userMessage)
  newMessage.value = ''

  await nextTick()
  scrollToBottom()

  // Simulate AI response
  isTyping.value = true
  await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000))

  const aiMessage = {
    id: Date.now() + 1,
    sender: 'Veya',
    text: aiResponses[Math.floor(Math.random() * aiResponses.length)],
    time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    isAi: true,
  }

  isTyping.value = false
  messages.value.push(aiMessage)

  await nextTick()
  scrollToBottom()
}

function scrollToBottom() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

onMounted(() => {
  scrollToBottom()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--background);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--surface-elevated);
  border-bottom: 1px solid var(--border);
}

.chat-info h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  color: var(--text-primary);
}

.status-indicator {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.status-indicator.online {
  color: var(--success);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 6px var(--success);
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  background: var(--surface);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.icon-btn:hover {
  background: var(--surface-hover);
  color: var(--text-primary);
}

.messages-area {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.date-separator {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--text-muted);
  font-size: 0.75rem;
  margin: 0.5rem 0;
}

.date-separator::before,
.date-separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border);
}

.message {
  display: flex;
  gap: 0.75rem;
  max-width: 80%;
  animation: fadeSlideIn 0.3s ease-out;
}

@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.user-message {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.ai-message {
  align-self: flex-start;
}

.message-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--surface);
  flex-shrink: 0;
  color: var(--text-secondary);
}

.ai-message .message-avatar {
  background: linear-gradient(135deg, var(--accent), var(--primary));
  color: white;
}

.message-content {
  background: var(--surface-elevated);
  padding: 0.875rem 1rem;
  border-radius: 16px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border);
}

.user-message .message-content {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border: none;
}

.message-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.375rem;
}

.sender-name {
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--text-primary);
}

.user-message .sender-name {
  color: rgba(255, 255, 255, 0.9);
}

.message-time {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.user-message .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message-text {
  line-height: 1.5;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.user-message .message-text {
  color: white;
}

.message-text :deep(strong) {
  font-weight: 600;
}

.typing-indicator .message-content {
  padding: 1rem;
}

.typing-dots {
  display: flex;
  gap: 4px;
}

.typing-dots span {
  width: 8px;
  height: 8px;
  background: var(--text-muted);
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite;
}

.typing-dots span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-dots span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
  }
  30% {
    transform: translateY(-8px);
  }
}

.input-area {
  background: var(--surface-elevated);
  padding: 1rem 1.5rem;
  border-top: 1px solid var(--border);
}

.input-tools {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tool-btn {
  background: var(--surface);
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
}

.tool-btn:hover {
  background: var(--surface-hover);
  color: var(--primary);
  transform: scale(1.1);
}

.input-wrapper {
  display: flex;
  gap: 0.75rem;
}

.input-wrapper input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid var(--border);
  border-radius: 12px;
  font-size: 0.9375rem;
  transition: all 0.3s;
  background: var(--input-bg);
  color: var(--text-primary);
}

.input-wrapper input::placeholder {
  color: var(--text-muted);
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--primary);
  background: var(--surface-elevated);
  box-shadow: 0 0 0 4px var(--primary-muted);
}

.input-wrapper input:disabled {
  opacity: 0.7;
}

.send-btn {
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: var(--shadow-glow);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
