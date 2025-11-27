<template>
  <div class="chat-container">
    <div class="chat-header">
      <div class="chat-info">
        <h2>{{ roomName }}</h2>
        <span class="status-indicator online">● Active</span>
      </div>
      <div class="chat-actions">
        <button class="icon-btn" title="Search messages">🔍</button>
        <button class="icon-btn" title="Room settings">⚙️</button>
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
          {{ message.isAi ? '🤖' : '👤' }}
        </div>
        <div class="message-content">
          <div class="message-header">
            <span class="sender-name">{{ message.sender }}</span>
            <span class="message-time">{{ message.time }}</span>
          </div>
          <div class="message-text" v-html="formatMessage(message.text)"></div>
          <div v-if="message.reactions" class="message-reactions">
            <span v-for="(count, emoji) in message.reactions" :key="emoji" class="reaction">
              {{ emoji }} {{ count }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="isTyping" class="typing-indicator">
        <div class="message ai-message">
          <div class="message-avatar">🤖</div>
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
        <button class="tool-btn" title="Attach file">📎</button>
        <button class="tool-btn" title="Add emoji">😊</button>
        <button class="tool-btn" title="Voice message">🎤</button>
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
          <span class="send-icon">➤</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'

const props = defineProps({
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
    sender: 'AI Assistant',
    text: "Hello! 👋 Welcome to the AI Room. I'm here to help you with your tasks and answer any questions you might have.",
    time: '10:30 AM',
    isAi: true,
    reactions: { '👍': 2 },
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
    sender: 'AI Assistant',
    text: "Of course! Here's how our collaboration works:\n\n• **Tasks**: Create and assign tasks to team members or AI agents\n• **Knowledge Base**: Share documents and references that AI can learn from\n• **Real-time Chat**: Communicate with your team and AI in real-time\n• **AI Analysis**: Get intelligent insights and suggestions",
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
    sender: 'AI Assistant',
    text: "Absolutely! Just upload your files using the 📎 button below, and I'll analyze them for you. I can provide:\n\n✅ Code reviews and suggestions\n✅ Documentation summaries\n✅ Task extraction and prioritization\n✅ Quality improvement recommendations",
    time: '10:34 AM',
    isAi: true,
    reactions: { '🚀': 1, '💡': 3 },
  },
])

const aiResponses = [
  "That's a great question! Let me think about it...\n\nBased on my analysis, I would recommend breaking this down into smaller, manageable tasks. Would you like me to help create a task list?",
  "I've analyzed your request and here are my thoughts:\n\n• First, we should review the current status\n• Then, identify any blockers\n• Finally, create an action plan\n\nWould you like to proceed with this approach?",
  "Interesting point! 🤔 Here's what I found:\n\n**Key Insights:**\n- The data suggests a positive trend\n- There are a few areas for improvement\n- I recommend focusing on the core objectives first",
  "I'm on it! 🚀 Give me a moment to process this...\n\nDone! I've analyzed the information and created a summary for you. The main takeaways are:\n1. Strong foundation in place\n2. Room for optimization\n3. Clear path forward",
  "Great idea! Let me help you implement that.\n\n**Next Steps:**\n✅ Define clear objectives\n✅ Set up the workflow\n✅ Monitor progress\n\nI'll be here to assist throughout the process!",
]

function formatMessage(text) {
  // Simple markdown-like formatting
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>')
    .replace(/• /g, '&bull; ')
    .replace(/✅/g, '<span class="check">✅</span>')
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
    sender: 'AI Assistant',
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
  background: #f8fafc;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
}

.chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
}

.chat-info h2 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.status-indicator {
  font-size: 0.75rem;
  color: #6b7280;
}

.status-indicator.online {
  color: #22c55e;
}

.chat-actions {
  display: flex;
  gap: 0.5rem;
}

.icon-btn {
  background: #f1f5f9;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-btn:hover {
  background: #e2e8f0;
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
  color: #94a3b8;
  font-size: 0.75rem;
  margin: 0.5rem 0;
}

.date-separator::before,
.date-separator::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e2e8f0;
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
  font-size: 1.25rem;
  background: #f1f5f9;
  flex-shrink: 0;
}

.ai-message .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.message-content {
  background: white;
  padding: 0.875rem 1rem;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.user-message .message-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
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
  color: #1e293b;
}

.user-message .sender-name {
  color: rgba(255, 255, 255, 0.9);
}

.message-time {
  font-size: 0.7rem;
  color: #94a3b8;
}

.user-message .message-time {
  color: rgba(255, 255, 255, 0.7);
}

.message-text {
  line-height: 1.5;
  font-size: 0.9375rem;
}

.message-text :deep(strong) {
  font-weight: 600;
}

.message-reactions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.reaction {
  background: #f1f5f9;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reaction:hover {
  background: #e2e8f0;
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
  background: #94a3b8;
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
  background: white;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e5e7eb;
}

.input-tools {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.tool-btn {
  background: #f1f5f9;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s;
}

.tool-btn:hover {
  background: #e2e8f0;
  transform: scale(1.1);
}

.input-wrapper {
  display: flex;
  gap: 0.75rem;
}

.input-wrapper input {
  flex: 1;
  padding: 0.875rem 1rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.9375rem;
  transition: all 0.3s;
  background: #f8fafc;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #667eea;
  background: white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.input-wrapper input:disabled {
  opacity: 0.7;
}

.send-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.send-icon {
  font-size: 1.25rem;
}
</style>
