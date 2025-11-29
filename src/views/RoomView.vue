<script setup>
import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import roomService from '@/services/roomService'
import taskService from '@/services/taskService'
import knowledgeService from '@/services/knowledgeService'
import aiService from '@/services/aiService'
import documentService from '@/services/documentService'
import AppIcon from '@/components/ui/AppIcon.vue'

const route = useRoute()
const router = useRouter()
const roomId = ref(route.params.id)

const room = ref(null)
const messages = ref([])
const tasks = ref([])
const goals = ref([])
const knowledgeBase = ref(null)
const documents = ref([])
const members = ref([])
const loading = ref(true)
const error = ref(null)
const messageInput = ref('')
const messageInputField = ref(null)
const sending = ref(false)
const messagesContainer = ref(null)
const activePanel = ref('tasks') // tasks, knowledge, documents
const showMobilePanelMenu = ref(false)
const showMobilePanel = ref(false)
const replyingTo = ref(null)
const activeMessageIndex = ref(-1)
const draggedMessageId = ref(null)
const draggedTaskId = ref(null)
const showRoomSettings = ref(false)
const customInstructions = ref('')
const roomName = ref('')
const aiThinking = ref(false)

// AI Features
const showAIMenu = ref(false)
const aiLoading = ref(false)
const showTaskDialog = ref(false)
const newTaskTitle = ref('')
const newTaskAssignee = ref('')
const editingTaskId = ref(null)
const editingTaskTitle = ref('')

// KB Editing
const editingKBSummary = ref(false)
const kbSummaryInput = ref('')
const newDecision = ref('')
const newLink = ref({ title: '', url: '' })
const newResource = ref({ title: '', url: '', description: '' })
const showAddDecision = ref(false)
const showAddLink = ref(false)
const showAddResource = ref(false)

// Document Upload
const isDraggingFile = ref(false)
const uploadingFile = ref(false)
const uploadProgress = ref(0)
const documentQuestion = ref('')
const askingDocument = ref(false)
const showDocUpload = ref(false)
const uploadingDoc = ref(false)
const docUploadProgress = ref(0)
const docSearchQuery = ref('')
const docSearchResults = ref([])

// Typing Indicators
const typingUsers = ref({})
const typingTimeout = ref(null)

// Online Presence
const onlineUserIds = ref([])

// Mention autocomplete
const showMentionMenu = ref(false)
const mentionSearch = ref('')
const mentionPosition = ref({ top: 0, left: 0 })
const mentionActiveIndex = ref(0)

// Slash commands
const showCommandMenu = ref(false)
const commandSearch = ref('')
const commandActiveIndex = ref(0)

// Reactions
const reactionOptions = ['👍', '🎉', '❤️', '👀', '😂', '🤪']
const messageReactions = ref({})
const myReactions = ref({})

// Smart Suggestions

// Notifications
const notificationsEnabled = ref(false)

// WebSocket connection
let ws = null

// Computed
const todoTasks = computed(() => tasks.value.filter((t) => t.status === 'todo'))
const inProgressTasks = computed(() => tasks.value.filter((t) => t.status === 'in_progress'))
const completedTasks = computed(() => tasks.value.filter((t) => t.status === 'done'))

// All assignable members including AI
const assignableMembers = computed(() => {
  const list = [{ id: 'ai', username: 'Veya', isAI: true }]
  members.value.forEach((m) => {
    list.push({ id: m.user_id, username: m.username, isAI: false })
  })
  return list
})

// Online members with presence info
const onlineMembers = computed(() => {
  return members.value.map((m) => ({
    ...m,
    isOnline: onlineUserIds.value.includes(m.user_id),
  }))
})

const onlineCount = computed(() => onlineUserIds.value.length)

const slashCommands = [
  {
    id: 'help',
    label: 'Help',
    description: 'Insert /help to see available commands',
    action: 'insert',
    text: '/help ',
  },
  {
    id: 'summarize',
    label: 'Summarize chat',
    description: 'Ask AI to summarize the recent conversation',
    action: 'summarize',
  },
  {
    id: 'ask',
    label: 'Ask Documents',
    description: 'Ask AI a question about uploaded documents',
    action: 'insert',
    text: '/ask ',
  },
  {
    id: 'docs',
    label: 'List Documents',
    description: 'Show all uploaded documents',
    action: 'insert',
    text: '/docs ',
  },
  {
    id: 'tasks',
    label: 'Share tasks',
    description: 'Drop the current task board into the chat',
    action: 'tasks',
  },
  {
    id: 'kb',
    label: 'Share knowledge',
    description: 'Insert the latest knowledge base context',
    action: 'kb',
  },
  {
    id: 'ask-ai',
    label: 'Ask Veya',
    description: 'Mention Veya directly',
    action: 'insert',
    text: '@Veya ',
  },
]

// Filtered members for @mention autocomplete
const filteredMentions = computed(() => {
  if (!mentionSearch.value) return assignableMembers.value
  const search = mentionSearch.value.toLowerCase()
  return assignableMembers.value.filter((m) => m.username.toLowerCase().includes(search))
})

const filteredCommands = computed(() => {
  if (!commandSearch.value) return slashCommands
  const search = commandSearch.value.toLowerCase()
  return slashCommands.filter(
    (command) =>
      command.id.toLowerCase().includes(search) ||
      command.label.toLowerCase().includes(search) ||
      command.description.toLowerCase().includes(search),
  )
})

// Fetch room details
const fetchRoom = async () => {
  try {
    loading.value = true
    error.value = null

    // Fetch room details
    try {
      const roomDetails = await roomService.getRoom(roomId.value)
      room.value = roomDetails
      customInstructions.value = roomDetails?.custom_ai_instructions || ''
      roomName.value = roomDetails?.name || ''
    } catch (err) {
      console.error('Failed to load room info:', err)
      room.value = {
        id: roomId.value,
        name: 'AI Room',
        description: 'Collaborate with AI',
      }
    }

    // Fetch room messages
    const messagesResponse = await roomService.getRoomMessages(roomId.value, { limit: 50 })
    messages.value = (messagesResponse.items || messagesResponse || []).reverse()
    activeMessageIndex.value = messages.value.length - 1
    await nextTick()
    scrollToBottom()

    // Fetch tasks
    await fetchTasks()

    // Fetch goals
    await fetchGoals()

    // Fetch knowledge base
    await fetchKnowledgeBase()

    // Fetch documents
    await fetchDocuments()

    // Fetch room members
    await fetchMembers()
  } catch (err) {
    console.error('Failed to fetch room:', err)
    error.value = err.response?.data?.detail || 'Failed to load room'
  } finally {
    loading.value = false
  }
}

// Fetch room members
const fetchMembers = async () => {
  try {
    const response = await roomService.getRoomMembers(roomId.value)
    members.value = response || []
  } catch (err) {
    console.error('Failed to fetch members:', err)
  }
}

// Fetch tasks
const fetchTasks = async () => {
  try {
    const response = await taskService.getRoomTasks(roomId.value)
    tasks.value = response || []
  } catch (err) {
    console.error('Failed to fetch tasks:', err)
  }
}

// Fetch goals
const fetchGoals = async () => {
  try {
    const response = await knowledgeService.getRoomGoals(roomId.value)
    goals.value = response || []
  } catch (err) {
    console.error('Failed to fetch goals:', err)
  }
}

// Fetch knowledge base
const fetchKnowledgeBase = async () => {
  try {
    const response = await knowledgeService.getRoomKB(roomId.value)
    knowledgeBase.value = response
  } catch (err) {
    console.error('Failed to fetch knowledge base:', err)
  }
}

// Fetch documents
const fetchDocuments = async () => {
  try {
    const response = await documentService.getRoomDocuments(roomId.value)
    documents.value = response || []
  } catch (err) {
    console.error('Failed to fetch documents:', err)
  }
}

// Document Upload Methods
const handleFileDragOver = (e) => {
  e.preventDefault()
  isDraggingFile.value = true
}

const handleFileDragLeave = () => {
  isDraggingFile.value = false
}

const handleFileDrop = async (e) => {
  e.preventDefault()
  isDraggingFile.value = false

  const files = e.dataTransfer?.files
  if (files && files.length > 0) {
    await uploadDocument(files[0])
  }
}

const handleFileSelect = async (e) => {
  const files = e.target?.files
  if (files && files.length > 0) {
    await uploadDocument(files[0])
  }
}

const uploadDocument = async (file) => {
  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-powerpoint',
  ]

  if (!allowedTypes.includes(file.type)) {
    alert('Please upload a PDF or PowerPoint file.')
    return
  }

  // Check file size (20MB max)
  if (file.size > 20 * 1024 * 1024) {
    alert('File too large. Maximum size is 20MB.')
    return
  }

  try {
    uploadingFile.value = true
    uploadProgress.value = 0

    const doc = await documentService.uploadDocument(roomId.value, file, (progress) => {
      uploadProgress.value = progress
    })

    documents.value.unshift(doc)
    try {
      await knowledgeService.addResource(roomId.value, {
        title: doc.filename || 'Uploaded document',
        url: doc.id,
        description: doc.summary || 'Document uploaded to room',
      })
      await fetchKnowledgeBase()
      await fetchGoals()
    } catch (err) {
      console.error('Failed to append upload to KB:', err)
    }
    uploadProgress.value = 100
  } catch (err) {
    console.error('Failed to upload document:', err)
    alert('Failed to upload document. Please try again.')
  } finally {
    uploadingFile.value = false
    uploadProgress.value = 0
  }
}

const deleteDocument = async (docId) => {
  if (!confirm('Are you sure you want to delete this document?')) return

  try {
    await documentService.deleteDocument(roomId.value, docId)
    documents.value = documents.value.filter((d) => d.id !== docId)
    try {
      await knowledgeService.removeResource(roomId.value, docId)
      await fetchKnowledgeBase()
      await fetchGoals()
    } catch (err) {
      console.error('Failed to remove document from KB:', err)
    }
  } catch (err) {
    console.error('Failed to delete document:', err)
  }
}

const askAboutDocuments = async () => {
  if (!documentQuestion.value.trim()) return

  try {
    askingDocument.value = true
    const result = await documentService.askDocument(roomId.value, documentQuestion.value.trim())

    // Add AI response to chat
    messages.value.push({
      id: `doc-qa-${Date.now()}`,
      sender_type: 'ai',
      sender_name: 'Veya',
      content: `📚 **Document Q&A:**\n\n**Q:** ${result.question}\n\n**A:** ${result.answer}`,
      created_at: new Date().toISOString(),
    })

    documentQuestion.value = ''
    nextTick(() => scrollToBottom())
  } catch (err) {
    console.error('Failed to ask about documents:', err)
    alert('Failed to process your question.')
  } finally {
    askingDocument.value = false
  }
}

// Documents Panel Methods
const handleDocumentUpload = async (event) => {
  const file = event.target?.files?.[0]
  if (!file) return

  await uploadDocumentWithProgress(file)
}

const handleDocDrop = async (event) => {
  const file = event.dataTransfer?.files?.[0]
  if (!file) return

  await uploadDocumentWithProgress(file)
}

const uploadDocumentWithProgress = async (file) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ]
  if (!allowedTypes.includes(file.type)) {
    alert('Please upload a PDF or PowerPoint file.')
    return
  }

  if (file.size > 20 * 1024 * 1024) {
    alert('File too large. Maximum size is 20MB.')
    return
  }

  try {
    uploadingDoc.value = true
    docUploadProgress.value = 0

    const doc = await documentService.uploadDocument(roomId.value, file, (progress) => {
      docUploadProgress.value = progress
    })

    documents.value.unshift(doc)
    try {
      await knowledgeService.addResource(roomId.value, {
        title: doc.filename || 'Uploaded document',
        url: doc.id,
        description: doc.summary || 'Document uploaded to room',
      })
      await fetchKnowledgeBase()
      await fetchGoals()
    } catch (err) {
      console.error('Failed to append upload to KB:', err)
    }
    showDocUpload.value = false
  } catch (err) {
    console.error('Failed to upload document:', err)
    alert('Failed to upload document.')
  } finally {
    uploadingDoc.value = false
    docUploadProgress.value = 0
  }
}

const mentionDocument = (doc) => {
  const ref = `@doc:${doc.filename || doc.id}`
  messageInput.value = messageInput.value ? `${messageInput.value} ${ref}` : ref
  nextTick(() => {
    if (messageInputField.value) {
      messageInputField.value.focus()
    }
  })
}

const searchDocuments = async () => {
  if (!docSearchQuery.value.trim()) {
    docSearchResults.value = []
    return
  }

  try {
    const results = await documentService.searchDocuments(roomId.value, docSearchQuery.value.trim())
    docSearchResults.value = results || []
  } catch (err) {
    console.error('Failed to search documents:', err)
  }
}

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let i = 0
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024
    i++
  }
  return `${bytes.toFixed(1)} ${units[i]}`
}

// Typing indicator methods
const sendTypingIndicator = () => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'typing',
        is_typing: true,
      }),
    )

    // Clear any existing timeout
    if (typingTimeout.value) {
      clearTimeout(typingTimeout.value)
    }

    // Set timeout to stop typing indicator
    typingTimeout.value = setTimeout(() => {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(
          JSON.stringify({
            type: 'typing',
            is_typing: false,
          }),
        )
      }
    }, 3000)
  }
}

const typingUsersDisplay = computed(() => {
  const users = Object.values(typingUsers.value)
  if (users.length === 0) return ''
  if (users.length === 1) return `${users[0]} is typing...`
  if (users.length === 2) return `${users[0]} and ${users[1]} are typing...`
  return `${users.length} people are typing...`
})

// KB Editing Methods
const startEditKBSummary = () => {
  kbSummaryInput.value = knowledgeBase.value?.summary || ''
  editingKBSummary.value = true
}

const saveKBSummary = async () => {
  try {
    await knowledgeService.updateRoomKB(roomId.value, { summary: kbSummaryInput.value })
    if (knowledgeBase.value) {
      knowledgeBase.value.summary = kbSummaryInput.value
    } else {
      knowledgeBase.value = { summary: kbSummaryInput.value }
    }
    editingKBSummary.value = false
  } catch (err) {
    console.error('Failed to update KB summary:', err)
  }
}

const addKBDecision = async () => {
  if (!newDecision.value.trim()) return
  try {
    await knowledgeService.addDecision(roomId.value, newDecision.value.trim())
    if (!knowledgeBase.value) knowledgeBase.value = {}
    if (!knowledgeBase.value.key_decisions) knowledgeBase.value.key_decisions = []
    knowledgeBase.value.key_decisions.push(newDecision.value.trim())
    newDecision.value = ''
    showAddDecision.value = false
  } catch (err) {
    console.error('Failed to add decision:', err)
  }
}

const addKBLink = async () => {
  if (!newLink.value.title.trim() || !newLink.value.url.trim()) return
  try {
    await knowledgeService.addLink(roomId.value, { ...newLink.value })
    if (!knowledgeBase.value) knowledgeBase.value = {}
    if (!knowledgeBase.value.important_links) knowledgeBase.value.important_links = []
    knowledgeBase.value.important_links.push({ ...newLink.value })
    newLink.value = { title: '', url: '' }
    showAddLink.value = false
  } catch (err) {
    console.error('Failed to add link:', err)
  }
}

const addKBResource = async () => {
  if (!newResource.value.title.trim() || !newResource.value.url.trim()) return
  try {
    await knowledgeService.addResource(roomId.value, { ...newResource.value })
    if (!knowledgeBase.value) knowledgeBase.value = {}
    if (!knowledgeBase.value.resources) knowledgeBase.value.resources = []
    knowledgeBase.value.resources.push({ ...newResource.value })
    newResource.value = { title: '', url: '', description: '' }
    showAddResource.value = false
  } catch (err) {
    console.error('Failed to add resource:', err)
  }
}

// Create task
const createTask = async () => {
  if (!newTaskTitle.value.trim()) return

  try {
    let detectedAssignee = newTaskAssignee.value
    if (!detectedAssignee) {
      detectedAssignee = detectAssigneeForText(newTaskTitle.value.trim())
    }

    const taskData = {
      title: newTaskTitle.value.trim(),
    }
    if (detectedAssignee) {
      taskData.assignee_id = detectedAssignee
    }
    const task = await taskService.createTask(roomId.value, taskData)
    tasks.value.unshift(task)
    newTaskTitle.value = ''
    newTaskAssignee.value = ''
    showTaskDialog.value = false
  } catch (err) {
    console.error('Failed to create task:', err)
  }
}

// Update task status
const updateTaskStatus = async (task, newStatus) => {
  try {
    const updated = await taskService.updateTask(task.id, { status: newStatus })
    const index = tasks.value.findIndex((t) => t.id === task.id)
    if (index !== -1) {
      tasks.value[index] = updated
    }
  } catch (err) {
    console.error('Failed to update task:', err)
  }
}

// Update task assignee
const updateTaskAssignee = async (task, newAssigneeId) => {
  try {
    const updated = await taskService.updateTask(task.id, { assignee_id: newAssigneeId })
    const index = tasks.value.findIndex((t) => t.id === task.id)
    if (index !== -1) {
      tasks.value[index] = updated
    }
  } catch (err) {
    console.error('Failed to update task assignee:', err)
  }
}

const startEditingTask = (task) => {
  editingTaskId.value = task.id
  editingTaskTitle.value = task.title
}

const saveTaskEdit = async (task) => {
  if (!editingTaskTitle.value.trim()) return
  try {
    const updated = await taskService.updateTask(task.id, { title: editingTaskTitle.value.trim() })
    const index = tasks.value.findIndex((t) => t.id === task.id)
    if (index !== -1) {
      tasks.value[index] = updated
    }
  } catch (err) {
    console.error('Failed to update task title:', err)
  } finally {
    editingTaskId.value = null
    editingTaskTitle.value = ''
  }
}

const cancelTaskEdit = () => {
  editingTaskId.value = null
  editingTaskTitle.value = ''
}

const resolveTask = (task) => {
  updateTaskStatus(task, 'done')
}

const deleteTask = async (task) => {
  try {
    await taskService.deleteTask(task.id)
    tasks.value = tasks.value.filter((t) => t.id !== task.id)
  } catch (err) {
    console.error('Failed to delete task:', err)
  }
}

const openRoomSettings = () => {
  showRoomSettings.value = true
}

const saveRoomSettings = async () => {
  try {
    const updated = await roomService.updateRoomSettings(roomId.value, {
      custom_ai_instructions: customInstructions.value,
      name: roomName.value,
    })
    room.value = updated
    showRoomSettings.value = false
  } catch (err) {
    console.error('Failed to save room settings:', err)
    alert('Failed to save room settings')
  }
}

const deleteRoom = async () => {
  if (!confirm('Delete this room? This cannot be undone.')) return
  try {
    await roomService.deleteRoom(roomId.value)
    router.push('/')
  } catch (err) {
    console.error('Failed to delete room:', err)
    alert('Failed to delete room')
  }
}

const escapeHtml = (text) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')

const renderMessage = (text) => {
  if (!text) return ''

  // First, extract and protect mentions/commands before escaping
  const mentions = []
  const commands = []
  let processed = text

  // Extract @mentions - match @username (word characters only)
  processed = processed.replace(/@(\w+)/g, (match, name) => {
    const idx = mentions.length
    mentions.push(name)
    return `__MENTION_${idx}__`
  })

  // Extract /commands
  processed = processed.replace(/(\/\w+)/g, (match) => {
    const idx = commands.length
    commands.push(match)
    return `__COMMAND_${idx}__`
  })

  // Now escape HTML
  let safe = escapeHtml(processed)

  // Code blocks ``` ```
  safe = safe.replace(/```([\s\S]*?)```/g, (_m, code) => {
    return `<pre><code>${code.trim()}</code></pre>`
  })

  // Bold **text**
  safe = safe.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  // Italic *text*
  safe = safe.replace(/\*(.+?)\*/g, '<em>$1</em>')
  // Inline code `code`
  safe = safe.replace(/`([^`]+)`/g, '<code>$1</code>')
  // Links [text](url)
  safe = safe.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>',
  )
  safe = safe.replace(/\n/g, '<br/>')

  // Restore mentions with styling (blue highlight visible in message bubble)
  mentions.forEach((name, idx) => {
    safe = safe.replace(`__MENTION_${idx}__`, `<span class="mention-highlight">@${name}</span>`)
  })

  // Restore commands with styling (blue highlight visible in message bubble)
  commands.forEach((cmd, idx) => {
    safe = safe.replace(`__COMMAND_${idx}__`, `<span class="command-highlight">${cmd}</span>`)
  })

  return safe
}

const detectAssigneeForText = (text) => {
  if (!text) return null
  const lowered = text.toLowerCase()
  const found = assignableMembers.value.find((member) =>
    lowered.includes(member.username.toLowerCase()),
  )
  return found ? found.id : null
}

const handleTaskDragStart = (task) => {
  draggedTaskId.value = task.id
}

const handleTaskDrop = (newStatus) => {
  if (!draggedTaskId.value) return
  const task = tasks.value.find((t) => t.id === draggedTaskId.value)
  draggedTaskId.value = null
  if (!task || task.status === newStatus) return
  updateTaskStatus(task, newStatus)
}

// Handle @mention input
const handleMessageInput = (e) => {
  const value = e.target.value
  const cursorPos = e.target.selectionStart

  // Check if we're typing a mention
  const textBeforeCursor = value.substring(0, cursorPos)
  const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
  const commandMatch = textBeforeCursor.match(/\/(\w*)$/)

  if (mentionMatch) {
    mentionSearch.value = mentionMatch[1]
    showMentionMenu.value = true
    // Position the menu (simplified)
    mentionPosition.value = { bottom: 60, left: 20 }
    mentionActiveIndex.value = 0
  } else {
    showMentionMenu.value = false
    mentionSearch.value = ''
  }

  if (commandMatch) {
    commandSearch.value = commandMatch[1]
    showCommandMenu.value = true
    commandActiveIndex.value = 0
  } else {
    showCommandMenu.value = false
    commandSearch.value = ''
  }
}

// Insert mention
const insertMention = (member) => {
  const inputEl = messageInputField.value
  const cursorPos = inputEl?.selectionStart ?? messageInput.value.length
  const textBeforeCursor = messageInput.value.substring(0, cursorPos)
  const textAfterCursor = messageInput.value.substring(cursorPos)

  // Find the @ position
  const mentionStart = textBeforeCursor.lastIndexOf('@')
  const newText =
    textBeforeCursor.substring(0, mentionStart) + '@' + member.username + ' ' + textAfterCursor

  messageInput.value = newText
  showMentionMenu.value = false
  mentionSearch.value = ''
  nextTick(() => {
    if (inputEl) {
      const newCursorPos = mentionStart + member.username.length + 2
      inputEl.focus()
      inputEl.setSelectionRange(newCursorPos, newCursorPos)
    }
  })
}

const insertCommandText = (text) => {
  const inputEl = messageInputField.value
  const cursorPos = inputEl?.selectionStart ?? messageInput.value.length
  const textBeforeCursor = messageInput.value.substring(0, cursorPos)
  const textAfterCursor = messageInput.value.substring(cursorPos)
  const commandStart = textBeforeCursor.lastIndexOf('/')
  const startIndex = commandStart === -1 ? cursorPos : commandStart
  const newText = textBeforeCursor.substring(0, startIndex) + text + textAfterCursor

  messageInput.value = newText
  nextTick(() => {
    if (inputEl) {
      const newCursorPos = startIndex + text.length
      inputEl.focus()
      inputEl.setSelectionRange(newCursorPos, newCursorPos)
    }
  })
  showCommandMenu.value = false
  commandSearch.value = ''
}

const selectCommand = async (command) => {
  showCommandMenu.value = false
  commandSearch.value = ''

  if (command.action === 'insert') {
    insertCommandText(command.text)
    return
  }

  if (command.action === 'summarize') {
    await summarizeConversation()
    return
  }

  if (command.action === 'tasks') {
    addTasksSnapshotToChat()
    return
  }

  if (command.action === 'kb') {
    addKnowledgeSnapshotToChat()
    return
  }
}

const handleKeyDown = (e) => {
  if (e.key === 'Escape' && replyingTo.value) {
    replyingTo.value = null
  }

  if (showMentionMenu.value && filteredMentions.value.length > 0) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      mentionActiveIndex.value = (mentionActiveIndex.value + 1) % filteredMentions.value.length
      nextTick(() => {
        const items = document.querySelectorAll('.mention-menu .mention-item')
        const el = items[mentionActiveIndex.value]
        el?.scrollIntoView({ block: 'nearest' })
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      mentionActiveIndex.value =
        (mentionActiveIndex.value - 1 + filteredMentions.value.length) %
        filteredMentions.value.length
      nextTick(() => {
        const items = document.querySelectorAll('.mention-menu .mention-item')
        const el = items[mentionActiveIndex.value]
        el?.scrollIntoView({ block: 'nearest' })
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      insertMention(filteredMentions.value[mentionActiveIndex.value])
    } else if (e.key === 'Escape') {
      showMentionMenu.value = false
      mentionSearch.value = ''
    }
    return
  }

  if (showCommandMenu.value && filteredCommands.value.length > 0) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      commandActiveIndex.value = (commandActiveIndex.value + 1) % filteredCommands.value.length
      nextTick(() => {
        const items = document.querySelectorAll('.command-menu .mention-item')
        const el = items[commandActiveIndex.value]
        el?.scrollIntoView({ block: 'nearest' })
      })
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      commandActiveIndex.value =
        (commandActiveIndex.value - 1 + filteredCommands.value.length) %
        filteredCommands.value.length
      nextTick(() => {
        const items = document.querySelectorAll('.command-menu .mention-item')
        const el = items[commandActiveIndex.value]
        el?.scrollIntoView({ block: 'nearest' })
      })
    } else if (e.key === 'Enter') {
      e.preventDefault()
      // When Enter is pressed in command menu, insert the command text instead of executing
      const cmd = filteredCommands.value[commandActiveIndex.value]
      if (cmd) {
        insertCommandText(cmd.text || `/${cmd.id}`)
      }
    } else if (e.key === 'Escape') {
      showCommandMenu.value = false
      commandSearch.value = ''
    }
  }
}

// Handle Enter keydown - send message only if no menus are open
const handleEnterKeydown = (e) => {
  // If mention or command menu is open, let handleKeyDown handle it
  if (showMentionMenu.value || showCommandMenu.value) {
    return
  }
  // Otherwise, send the message
  e.preventDefault()
  sendMessage()
}

// AI Actions
const summarizeConversation = async () => {
  try {
    aiLoading.value = true
    const result = await aiService.summarizeRoom(roomId.value, 20)
    alert(`Summary:\n\n${result.summary}`)
  } catch (err) {
    console.error('Failed to summarize:', err)
    alert('Failed to summarize conversation')
  } finally {
    aiLoading.value = false
  }
}

const addTasksSnapshotToChat = () => {
  const sections = [
    { label: 'To Do', items: todoTasks.value },
    { label: 'In Progress', items: inProgressTasks.value },
    { label: 'Done', items: completedTasks.value },
  ]

  const contentParts = sections
    .filter((section) => section.items.length > 0)
    .map((section) => {
      const items = section.items
        .map((task) => {
          const assignee = task.assignee_name ? ` - ${task.assignee_name}` : ''
          return `${task.title}${assignee}`
        })
        .join('; ')
      return `${section.label}: ${items}`
    })

  const content =
    contentParts.length > 0
      ? `Here is the latest task board -> ${contentParts.join(' | ')}`
      : 'There are no tasks yet.'

  messages.value.push({
    id: `ai-task-${Date.now()}`,
    sender_type: 'ai',
    sender_name: 'Veya',
    content,
    created_at: new Date().toISOString(),
  })
  nextTick(() => scrollToBottom())
}

const addKnowledgeSnapshotToChat = () => {
  if (!knowledgeBase.value) {
    messages.value.push({
      id: `ai-kb-${Date.now()}`,
      sender_type: 'ai',
      sender_name: 'Veya',
      content: 'No knowledge base is available yet.',
      created_at: new Date().toISOString(),
    })
    return
  }

  const kb = knowledgeBase.value
  const goalsText =
    goals.value && goals.value.length
      ? `Goals: ${goals.value.map((g) => g.description).join(' | ')}`
      : ''
  const content = `Knowledge: ${kb.content || 'No content'}${goalsText ? `\n${goalsText}` : ''}`

  messages.value.push({
    id: `ai-kb-${Date.now()}`,
    sender_type: 'ai',
    sender_name: 'Veya',
    content,
    created_at: new Date().toISOString(),
  })
  nextTick(() => scrollToBottom())
}

const messageHasAIMention = (text) => {
  if (!text) return false
  return /@ai(\b|_)/i.test(text) || /@veya/i.test(text)
}

const buildAIContext = (content, replyMessage = null) => {
  const kb = knowledgeBase.value?.content
  const goalsText =
    goals.value && goals.value.length
      ? `Goals: ${goals.value.map((g) => g.description).join(' | ')}`
      : ''
  const contextParts = [content]
  if (replyMessage) {
    contextParts.push(
      `Reply target from ${replyMessage.sender_name || 'Unknown'}: ${replyMessage.content}`,
    )
  }
  if (kb) contextParts.push(`KB: ${kb}`)
  if (goalsText) contextParts.push(goalsText)
  if (room.value?.custom_ai_instructions) {
    contextParts.push(`Room instructions: ${room.value.custom_ai_instructions}`)
  }
  return contextParts.join('\n\n')
}

const triggerAIReply = async (content) => {
  try {
    aiLoading.value = true
    aiThinking.value = true
    const aiMessage = await aiService.chatWithAI(roomId.value, content)
    if (aiMessage?.content) {
      messages.value.push({
        id: `ai-${Date.now()}`,
        sender_type: 'ai',
        sender_name: 'Veya',
        content: aiMessage.content,
        created_at: new Date().toISOString(),
      })
      await nextTick()
      scrollToBottom()
    }
  } catch (err) {
    console.error('Failed to get AI reply:', err)
  } finally {
    aiLoading.value = false
    aiThinking.value = false
  }
}

const setReplyTarget = (message) => {
  replyingTo.value = message
  if (messagesContainer.value) {
    messagesContainer.value.focus()
  }
}

const cancelReply = () => {
  replyingTo.value = null
}

const toggleReaction = (message, emoji) => {
  const id = message.id
  const reactions = messageReactions.value[id] || {}
  const mine = myReactions.value[id] || {}
  const hasReacted = !!mine[emoji]
  const nextCount = Math.max((reactions[emoji] || 0) + (hasReacted ? -1 : 1), 0)
  messageReactions.value[id] = { ...reactions, [emoji]: nextCount }
  myReactions.value[id] = { ...mine, [emoji]: !hasReacted }

  // Send via WebSocket
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(
      JSON.stringify({
        type: 'reaction',
        message_id: id,
        emoji: emoji,
      }),
    )
  }
}

const handleMessagesKeyDown = (e) => {
  if (!messages.value.length) return
  if (e.key === 'ArrowUp') {
    e.preventDefault()
    activeMessageIndex.value =
      activeMessageIndex.value <= 0 ? messages.value.length - 1 : activeMessageIndex.value - 1
  } else if (e.key === 'ArrowDown') {
    e.preventDefault()
    activeMessageIndex.value =
      activeMessageIndex.value >= messages.value.length - 1 ? 0 : activeMessageIndex.value + 1
  } else if (e.key === 'Enter' || e.key === 'r') {
    e.preventDefault()
    setReplyTarget(messages.value[activeMessageIndex.value])
  } else if (e.key === 'l') {
    e.preventDefault()
    toggleReaction(messages.value[activeMessageIndex.value], '👍')
  }
}

const handleMessageDragStart = (message) => {
  draggedMessageId.value = message.id
}

const handleMessageDrop = () => {
  if (!draggedMessageId.value) return
  const message = messages.value.find((m) => m.id === draggedMessageId.value)
  if (message) {
    setReplyTarget(message)
  }
  draggedMessageId.value = null
}

// Send message
const sendMessage = async () => {
  if (!messageInput.value.trim() || sending.value) return

  const content = messageInput.value.trim()
  const wantsAIReply =
    messageHasAIMention(content) ||
    (!!replyingTo.value && replyingTo.value.sender_type === 'ai') ||
    (!!replyingTo.value && messageHasAIMention(content))
  const replyPayload = replyingTo.value ? { reply_to: replyingTo.value.id } : {}
  const aiContext = replyingTo.value
    ? `${content}\n\n(Replying to "${replyingTo.value.content}")`
    : content
  messageInput.value = ''
  replyingTo.value = null

  try {
    sending.value = true

    // Send via WebSocket if connected
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: 'message',
          content: content,
          ...replyPayload,
        }),
      )
      // Message will be added when broadcast is received
    } else {
      // Fallback to HTTP if WebSocket not connected
      const newMessage = await roomService.sendMessage(roomId.value, {
        content,
        sender_type: 'user',
        ...replyPayload,
      })
      messages.value.push(newMessage)
      await nextTick()
      scrollToBottom()

      if (wantsAIReply) {
        await triggerAIReply(buildAIContext(aiContext, replyingTo.value))
      }
    }
  } catch (err) {
    console.error('Failed to send message:', err)
    messageInput.value = content // Restore message
  } finally {
    sending.value = false
    showSmartSuggestions.value = false
    smartSuggestions.value = []
  }
}

// Notifications
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission()
    notificationsEnabled.value = permission === 'granted'
  }
}

const showNotification = (title, body, tag = 'ai-rooms') => {
  if (!notificationsEnabled.value || document.hasFocus()) return

  try {
    const notification = new Notification(title, {
      body: body.substring(0, 100),
      icon: '/favicon.ico',
      tag: tag,
      requireInteraction: false,
    })

    notification.onclick = () => {
      window.focus()
      notification.close()
    }

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000)
  } catch (err) {
    console.warn('Notification error:', err)
  }
}

const checkForMention = (message) => {
  const currentUsername = localStorage.getItem('username')
  const content = message.content?.toLowerCase() || ''

  // Check if mentioned
  if (currentUsername && content.includes(`@${currentUsername.toLowerCase()}`)) {
    showNotification(
      `${message.sender_name || 'Someone'} mentioned you`,
      message.content,
      `mention-${message.id}`,
    )
    return true
  }
  return false
}

// Connect to WebSocket
const connectWebSocket = () => {
  try {
    const userId = localStorage.getItem('user_id')
    if (!userId) {
      console.warn('No user_id found, skipping WebSocket connection')
      return
    }

    const wsUrl = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000'
    ws = new WebSocket(`${wsUrl}/ws/${roomId.value}?token=${userId}`)

    ws.onopen = () => {
      console.log('WebSocket connected to room:', roomId.value)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'message') {
          // Add new message to list
          messages.value.push(data.message)
          nextTick(() => scrollToBottom())

          // Check for mentions and show notification
          checkForMention(data.message)
        } else if (data.type === 'task_created' || data.type === 'task_updated') {
          // Handle real-time task updates
          if (data.task) {
            const index = tasks.value.findIndex((t) => t.id === data.task.id)
            if (index !== -1) {
              tasks.value[index] = data.task
            } else {
              tasks.value.unshift(data.task)
            }
          }
        } else if (data.type === 'task_deleted') {
          tasks.value = tasks.value.filter((t) => t.id !== data.task_id)
        } else if (data.type === 'kb_updated') {
          // Handle real-time KB updates
          if (data.kb) {
            knowledgeBase.value = data.kb
          }
          fetchGoals()
        } else if (data.type === 'document_uploaded') {
          // Handle new document uploads
          if (data.document) {
            const exists = documents.value.find((d) => d.id === data.document.id)
            if (!exists) {
              documents.value.unshift(data.document)
            }
          }
        } else if (data.type === 'document_deleted') {
          // Handle document deletion
          if (data.document_id) {
            documents.value = documents.value.filter((d) => d.id !== data.document_id)
          }
        } else if (data.type === 'system') {
          // Handle system messages (user joined/left)
          console.log('System message:', data.content)
          // Add system message to chat
          messages.value.push({
            id: `system-${Date.now()}`,
            sender_type: 'system',
            content: data.content,
            created_at: new Date().toISOString(),
          })
          nextTick(() => scrollToBottom())
        } else if (data.type === 'typing') {
          // Handle typing indicators
          if (data.is_typing) {
            typingUsers.value[data.user_id] = data.username
          } else {
            delete typingUsers.value[data.user_id]
          }
          // Auto-clear typing after 5 seconds
          setTimeout(() => {
            delete typingUsers.value[data.user_id]
          }, 5000)
        } else if (data.type === 'reaction') {
          // Handle incoming reactions from other users
          const msgId = data.message_id
          const emoji = data.emoji
          if (msgId && emoji) {
            const reactions = messageReactions.value[msgId] || {}
            reactions[emoji] = (reactions[emoji] || 0) + 1
            messageReactions.value[msgId] = { ...reactions }
          }
        } else if (data.type === 'room_updated') {
          // Update room metadata (name, instructions, etc.) when owner renames or updates settings
          if (data.room) {
            room.value = data.room
            // keep local roomName and customInstructions in sync
            roomName.value = data.room.name || roomName.value
            customInstructions.value = data.room.custom_ai_instructions || customInstructions.value
          }
        } else if (data.type === 'presence') {
          // Handle presence updates
          if (data.online_users) {
            onlineUserIds.value = data.online_users
          }
        }
      } catch (err) {
        console.error('WebSocket message error:', err)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    ws.onclose = (event) => {
      console.log('WebSocket disconnected, code:', event.code)
      // Attempt to reconnect after 3 seconds if not a policy violation
      if (event.code !== 1008 && event.code !== 1003) {
        setTimeout(() => {
          if (roomId.value) connectWebSocket()
        }, 3000)
      }
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

const getReplyTarget = (message) => {
  if (!message?.reply_to) return null
  return messages.value.find((m) => m.id === message.reply_to) || null
}

onMounted(() => {
  fetchRoom()
  connectWebSocket()
  requestNotificationPermission()
  nextTick(() => scrollToBottom())
})

onUnmounted(() => {
  if (ws) {
    ws.close()
  }
})

// Watch for new messages and scroll
watch(messages, () => {
  nextTick(() => scrollToBottom())
  activeMessageIndex.value = messages.value.length ? messages.value.length - 1 : -1
})

watch(filteredMentions, () => {
  mentionActiveIndex.value = 0
})

watch(filteredCommands, () => {
  commandActiveIndex.value = 0
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
            <span class="status-separator">·</span>
            <span class="online-indicator">
              <span class="online-dot"></span>
              {{ onlineCount }} online
            </span>
          </div>
        </div>
      </div>

      <div class="room-header-actions">
        <!-- Online Avatars -->
        <div class="online-avatars">
          <div
            v-for="member in onlineMembers.slice(0, 5)"
            :key="member.user_id"
            class="online-avatar-mini"
            :class="{ 'is-online': member.isOnline }"
            :title="member.username + (member.isOnline ? ' (online)' : '')"
          >
            {{ member.username?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div v-if="members.length > 5" class="online-avatar-more">+{{ members.length - 5 }}</div>
        </div>
        <button
          class="btn btn-ghost btn-sm mobile-toggle"
          @click="showMobilePanel = !showMobilePanel"
        >
          <AppIcon :name="showMobilePanel ? 'x' : 'menu'" size="sm" />
          <span>{{ showMobilePanel ? 'Hide Side' : 'Show Side' }}</span>
        </button>
        <button class="btn btn-ghost btn-sm" @click="openRoomSettings">Settings</button>
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
          <AppIcon name="alert" size="lg" />
          <p>{{ error }}</p>
          <button class="btn btn-secondary" @click="fetchRoom">Retry</button>
        </div>

        <!-- Messages -->
        <div
          v-else
          class="messages-container"
          ref="messagesContainer"
          tabindex="0"
          @keydown="handleMessagesKeyDown"
        >
          <div v-if="messages.length === 0" class="empty-messages">
            <div class="empty-icon">
              <AppIcon name="room" size="xl" />
            </div>
            <h3>Start the conversation</h3>
            <p>Send a message or ask the AI for help</p>
          </div>

          <div
            v-for="message in messages"
            :key="message.id"
            class="message"
            :class="[
              getMessageClass(message),
              { active: messages[activeMessageIndex]?.id === message.id },
            ]"
            draggable="true"
            @dragstart="handleMessageDragStart(message)"
            @click="activeMessageIndex = messages.indexOf(message)"
            @dblclick="setReplyTarget(message)"
          >
            <div class="message-avatar">
              <AppIcon v-if="message.sender_type === 'ai'" name="bot" size="sm" />
              <span v-else>{{ getSenderInitials(message.sender_name || 'U') }}</span>
            </div>
            <div class="message-content">
              <div class="message-header">
                <span class="message-sender">
                  {{ message.sender_name || (message.sender_type === 'ai' ? 'Veya' : 'User') }}
                </span>
                <span class="message-time">{{ formatTime(message.created_at) }}</span>
              </div>
              <div class="message-body">
                <div v-if="getReplyTarget(message)" class="reply-preview">
                  <span class="reply-label">
                    @{{ getReplyTarget(message)?.sender_name || 'Message' }}
                  </span>
                  <div class="reply-snippet">
                    {{ getReplyTarget(message)?.content || 'Original message' }}
                  </div>
                </div>
                <div v-html="renderMessage(message.content)"></div>
              </div>
              <div class="message-actions">
                <button class="link-btn" @click="setReplyTarget(message)">Reply</button>
                <div class="reactions">
                  <button
                    v-for="emoji in reactionOptions"
                    :key="emoji"
                    class="reaction-btn"
                    @click="toggleReaction(message, emoji)"
                  >
                    {{ emoji }}
                    <span
                      v-if="(messageReactions[message.id]?.[emoji] || 0) > 0"
                      class="reaction-count"
                    >
                      {{ messageReactions[message.id][emoji] }}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Message Input -->
        <div class="message-input-container" @dragover.prevent @drop.prevent="handleMessageDrop">
          <!-- Mention Autocomplete Menu -->
          <div v-if="showMentionMenu" class="mention-menu">
            <div class="mention-header">Mention someone</div>
            <div
              v-for="(member, index) in filteredMentions"
              :key="member.id"
              class="mention-item"
              :class="{ active: mentionActiveIndex === index }"
              @click="insertMention(member)"
              @mouseenter="mentionActiveIndex = index"
            >
              <span class="mention-avatar" :class="{ 'mention-ai': member.isAI }">
                <AppIcon v-if="member.isAI" name="bot" size="xs" />
                <span v-else>{{ getSenderInitials(member.username) }}</span>
              </span>
              <span class="mention-name">{{ member.username }}</span>
              <span v-if="member.isAI" class="mention-badge">AI</span>
            </div>
            <div v-if="filteredMentions.length === 0" class="mention-empty">No matches found</div>
          </div>

          <!-- Slash Command Menu -->
          <div v-if="showCommandMenu" class="command-menu">
            <div class="mention-header">Slash commands</div>
            <div
              v-for="(command, index) in filteredCommands"
              :key="command.id"
              class="mention-item"
              :class="{ active: commandActiveIndex === index }"
              @click="selectCommand(command)"
              @mouseenter="commandActiveIndex = index"
            >
              <span class="mention-avatar">
                <AppIcon name="sparkle" size="xs" />
              </span>
              <div class="command-copy">
                <span class="mention-name">/{{ command.id }}</span>
                <span class="command-description">{{ command.description }}</span>
              </div>
            </div>
            <div v-if="filteredCommands.length === 0" class="mention-empty">No commands found</div>
          </div>

          <div v-if="replyingTo" class="replying-pill glass-panel">
            <div class="replying-label">Replying to</div>
            <div class="replying-text">
              {{ replyingTo.sender_name || 'Message' }} — {{ replyingTo.content }}
            </div>
            <button class="chip-btn" @click="cancelReply">Cancel</button>
          </div>

          <div class="message-input-wrapper glass-panel">
            <input
              v-model="messageInput"
              type="text"
              class="message-input"
              placeholder="Type @ to mention, / for commands..."
              @keydown.enter="handleEnterKeydown"
              @input="handleMessageInput"
              @keydown="handleKeyDown"
              ref="messageInputField"
              :disabled="sending"
              maxlength="2000"
            />
            <button
              class="btn btn-primary send-btn btn-glow"
              @click="sendMessage"
              :disabled="!messageInput.trim() || sending"
            >
              <span v-if="sending" class="spinner spinner-sm"></span>
              <AppIcon v-else name="send" size="md" />
            </button>
          </div>
          <div v-if="aiThinking" class="ai-thinking">
            <span class="dot-pulse"></span>
            <span>AI is thinking...</span>
          </div>
        </div>
      </div>

      <!-- Side Panel -->
      <div
        class="side-panel"
        :class="{ 'mobile-hidden': !showMobilePanel }"
        style="display: flex; flex-direction: column"
      >
        <div class="panel-tabs desktop-tabs">
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
            Knowledge
          </button>
        </div>

        <div class="panel-tabs mobile-tabs">
          <button class="panel-tab" @click="showMobilePanelMenu = !showMobilePanelMenu">
            {{ activePanel === 'tasks' ? 'Tasks' : 'Knowledge' }}
            <AppIcon name="chevron-down" size="sm" />
          </button>
          <div v-if="showMobilePanelMenu" class="mobile-panel-menu">
            <div
              class="panel-tab"
              :class="{ active: activePanel === 'tasks' }"
              @click="
                activePanel = 'tasks';
                showMobilePanelMenu = false
              "
            >
              Tasks
            </div>
            <div
              class="panel-tab"
              :class="{ active: activePanel === 'knowledge' }"
              @click="
                activePanel = 'knowledge';
                showMobilePanelMenu = false
              "
            >
              Knowledge
            </div>
          </div>
        </div>

        <div class="panel-content" style="flex: 1; overflow-y: auto; min-height: 0">
          <!-- Tasks Panel -->
          <div v-if="activePanel === 'tasks'" class="tasks-panel">
            <div class="panel-header">
              <h3>Tasks</h3>
              <button @click="showTaskDialog = true" class="btn btn-ghost btn-sm">
                <AppIcon name="plus" size="xs" /> Add
              </button>
            </div>

            <!-- Task Board Columns -->
            <div class="task-board">
              <!-- Todo Column -->
              <div class="task-column">
                <div class="column-header">
                  <span class="column-title">To Do</span>
                  <span class="column-count">{{ todoTasks.length }}</span>
                </div>
                <div class="task-list" @dragover.prevent @drop="handleTaskDrop('todo')">
                  <div
                    v-for="task in todoTasks"
                    :key="task.id"
                    class="task-card"
                    draggable="true"
                    @dragstart="handleTaskDragStart(task)"
                  >
                    <div class="task-card-header">
                      <div class="task-title-wrap">
                        <input
                          v-if="editingTaskId === task.id"
                          v-model="editingTaskTitle"
                          class="task-edit-input"
                          @keyup.enter="saveTaskEdit(task)"
                        />
                        <span v-else class="task-title">{{ task.title }}</span>
                      </div>
                      <div class="task-card-actions">
                        <button
                          v-if="editingTaskId === task.id"
                          class="chip-btn"
                          @click="saveTaskEdit(task)"
                        >
                          Save
                        </button>
                        <button
                          v-if="editingTaskId === task.id"
                          class="chip-btn"
                          @click="cancelTaskEdit"
                        >
                          Cancel
                        </button>
                        <button v-else class="chip-btn" @click="startEditingTask(task)">
                          Edit
                        </button>
                        <button class="chip-btn" @click="resolveTask(task)">Resolve</button>
                        <button class="chip-btn danger" @click="deleteTask(task)">Delete</button>
                      </div>
                    </div>
                    <div class="task-card-footer">
                      <div class="task-assignee">
                        <span class="assignee-avatar">
                          {{
                            ['AI', 'Veya'].includes(task.assignee_name)
                              ? '🤖'
                              : task.assignee_name
                                ? getSenderInitials(task.assignee_name)
                                : '?'
                          }}
                        </span>
                        <div class="assignee-control">
                          <label class="assignee-label">Assignee</label>
                          <select
                            class="task-status-select assignee-select"
                            :value="
                              task.assignee_id ||
                              (['AI', 'Veya'].includes(task.assignee_name) ? 'ai' : '') ||
                              ''
                            "
                            @change="updateTaskAssignee(task, $event.target.value || null)"
                          >
                            <option value="">Unassigned</option>
                            <option
                              v-for="member in assignableMembers"
                              :key="member.id"
                              :value="member.id"
                            >
                              {{ member.username }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="task-controls">
                        <label class="assignee-label">Status</label>
                        <select
                          class="task-status-select"
                          :value="task.status"
                          @change="updateTaskStatus(task, $event.target.value)"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div v-if="todoTasks.length === 0" class="empty-column">No tasks</div>
                </div>
              </div>

              <!-- In Progress Column -->
              <div class="task-column">
                <div class="column-header">
                  <span class="column-title">In Progress</span>
                  <span class="column-count">{{ inProgressTasks.length }}</span>
                </div>
                <div class="task-list" @dragover.prevent @drop="handleTaskDrop('in_progress')">
                  <div
                    v-for="task in inProgressTasks"
                    :key="task.id"
                    class="task-card in-progress"
                    draggable="true"
                    @dragstart="handleTaskDragStart(task)"
                  >
                    <div class="task-card-header">
                      <div class="task-title-wrap">
                        <input
                          v-if="editingTaskId === task.id"
                          v-model="editingTaskTitle"
                          class="task-edit-input"
                          @keyup.enter="saveTaskEdit(task)"
                        />
                        <span v-else class="task-title">{{ task.title }}</span>
                      </div>
                      <div class="task-card-actions">
                        <button
                          v-if="editingTaskId === task.id"
                          class="chip-btn"
                          @click="saveTaskEdit(task)"
                        >
                          Save
                        </button>
                        <button
                          v-if="editingTaskId === task.id"
                          class="chip-btn"
                          @click="cancelTaskEdit"
                        >
                          Cancel
                        </button>
                        <button v-else class="chip-btn" @click="startEditingTask(task)">
                          Edit
                        </button>
                        <button class="chip-btn" @click="resolveTask(task)">Resolve</button>
                        <button class="chip-btn danger" @click="deleteTask(task)">Delete</button>
                      </div>
                    </div>
                    <div class="task-card-footer">
                      <div class="task-assignee">
                        <span class="assignee-avatar">
                          {{
                            ['AI', 'Veya'].includes(task.assignee_name)
                              ? '🤖'
                              : task.assignee_name
                                ? getSenderInitials(task.assignee_name)
                                : '?'
                          }}
                        </span>
                        <div class="assignee-control">
                          <label class="assignee-label">Assignee</label>
                          <select
                            class="task-status-select assignee-select"
                            :value="
                              task.assignee_id ||
                              (['AI', 'Veya'].includes(task.assignee_name) ? 'ai' : '') ||
                              ''
                            "
                            @change="updateTaskAssignee(task, $event.target.value || null)"
                          >
                            <option value="">Unassigned</option>
                            <option
                              v-for="member in assignableMembers"
                              :key="member.id"
                              :value="member.id"
                            >
                              {{ member.username }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="task-controls">
                        <label class="assignee-label">Status</label>
                        <select
                          class="task-status-select"
                          :value="task.status"
                          @change="updateTaskStatus(task, $event.target.value)"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div v-if="inProgressTasks.length === 0" class="empty-column">No tasks</div>
                </div>
              </div>

              <!-- Done Column -->
              <div class="task-column">
                <div class="column-header">
                  <span class="column-title">Done</span>
                  <span class="column-count">{{ completedTasks.length }}</span>
                </div>
                <div class="task-list" @dragover.prevent @drop="handleTaskDrop('done')">
                  <div
                    v-for="task in completedTasks"
                    :key="task.id"
                    class="task-card done"
                    draggable="true"
                    @dragstart="handleTaskDragStart(task)"
                  >
                    <div class="task-card-header">
                      <div class="task-title-wrap">
                        <input
                          v-if="editingTaskId === task.id"
                          v-model="editingTaskTitle"
                          class="task-edit-input"
                          @keyup.enter="saveTaskEdit(task)"
                        />
                        <span v-else class="task-title">{{ task.title }}</span>
                      </div>
                      <div class="task-card-actions">
                        <button
                          v-if="editingTaskId === task.id"
                          class="chip-btn"
                          @click="saveTaskEdit(task)"
                        >
                          Save
                        </button>
                        <button
                          v-if="editingTaskId === task.id"
                          class="chip-btn"
                          @click="cancelTaskEdit"
                        >
                          Cancel
                        </button>
                        <button v-else class="chip-btn" @click="startEditingTask(task)">
                          Edit
                        </button>
                        <button class="chip-btn" @click="resolveTask(task)">Resolve</button>
                      </div>
                    </div>
                    <div class="task-card-footer">
                      <div class="task-assignee">
                        <span class="assignee-avatar">
                          {{
                            ['AI', 'Veya'].includes(task.assignee_name)
                              ? '🤖'
                              : task.assignee_name
                                ? getSenderInitials(task.assignee_name)
                                : '?'
                          }}
                        </span>
                        <div class="assignee-control">
                          <label class="assignee-label">Assignee</label>
                          <select
                            class="task-status-select assignee-select"
                            :value="
                              task.assignee_id ||
                              (['AI', 'Veya'].includes(task.assignee_name) ? 'ai' : '') ||
                              ''
                            "
                            @change="updateTaskAssignee(task, $event.target.value || null)"
                          >
                            <option value="">Unassigned</option>
                            <option
                              v-for="member in assignableMembers"
                              :key="member.id"
                              :value="member.id"
                            >
                              {{ member.username }}
                            </option>
                          </select>
                        </div>
                      </div>
                      <div class="task-controls">
                        <label class="assignee-label">Status</label>
                        <select
                          class="task-status-select"
                          :value="task.status"
                          @change="updateTaskStatus(task, $event.target.value)"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div v-if="completedTasks.length === 0" class="empty-column">
                    No completed tasks
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Knowledge Panel (includes Documents) -->
          <div v-if="activePanel === 'knowledge'" class="knowledge-panel">
            <div class="panel-body kb-panel-body">
              <!-- Summary Section -->
              <div class="kb-section">
                <div class="kb-section-header">
                  <h4>Summary</h4>
                </div>
                <p class="kb-summary-text">
                  {{ knowledgeBase?.summary || knowledgeBase?.content || 'No summary available.' }}
                </p>
              </div>

              <!-- Key Decisions -->
              <div class="kb-section" v-if="knowledgeBase?.key_decisions?.length">
                <div class="kb-section-header">
                  <h4>Key Decisions</h4>
                </div>
                <ul class="kb-list">
                  <li v-for="(decision, idx) in knowledgeBase.key_decisions" :key="idx">
                    <AppIcon name="check-circle" size="xs" />
                    {{ decision }}
                  </li>
                </ul>
              </div>

              <!-- Links -->
              <div class="kb-section" v-if="knowledgeBase?.important_links?.length">
                <div class="kb-section-header">
                  <h4>Links</h4>
                </div>
                <ul class="kb-list kb-links-list">
                  <li v-for="(link, idx) in knowledgeBase.important_links" :key="idx">
                    <a :href="link.url" target="_blank" rel="noopener" class="kb-link">
                      <AppIcon name="link" size="xs" />
                      {{ link.title }}
                    </a>
                  </li>
                </ul>
              </div>

              <!-- Documents Section (merged) -->
              <div class="kb-section kb-documents-section">
                <div class="kb-section-header">
                  <h4>Documents</h4>
                  <button @click="showDocUpload = !showDocUpload" class="btn btn-ghost btn-xs">
                    <AppIcon name="upload" size="xs" /> Upload
                  </button>
                </div>

                <!-- Upload Area -->
                <div v-if="showDocUpload" class="doc-upload-section">
                  <div class="doc-upload-area" @dragover.prevent @drop.prevent="handleDocDrop">
                    <input
                      type="file"
                      ref="docFileInput"
                      @change="handleDocumentUpload"
                      accept=".pdf,.pptx"
                      hidden
                    />
                    <div class="upload-placeholder" @click="$refs.docFileInput.click()">
                      <AppIcon name="file-plus" size="md" />
                      <p>Drop PDF or PPTX here</p>
                    </div>
                  </div>
                  <div v-if="uploadingDoc" class="doc-upload-progress">
                    <div class="progress-bar">
                      <div class="progress-fill" :style="{ width: docUploadProgress + '%' }"></div>
                    </div>
                    <span>{{ docUploadProgress }}%</span>
                  </div>
                </div>

                <!-- Documents List -->
                <div v-if="documents.length" class="doc-items compact">
                  <div v-for="doc in documents" :key="doc._id" class="doc-item-compact">
                    <AppIcon
                      :name="doc.file_type === 'pdf' ? 'file-text' : 'presentation'"
                      size="sm"
                    />
                    <span class="doc-item-name">{{ doc.filename }}</span>
                    <button
                      class="chip-btn-xs danger"
                      @click="deleteDocument(doc.id)"
                      title="Delete"
                    >
                      <AppIcon name="x" size="xs" />
                    </button>
                  </div>
                </div>
                <p v-else class="doc-empty-small">No documents yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Task Dialog -->
    <div v-if="showTaskDialog" class="modal-overlay" @click.self="showTaskDialog = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Create New Task</h3>
          <button @click="showTaskDialog = false" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Task Title</label>
            <input
              v-model="newTaskTitle"
              type="text"
              placeholder="What needs to be done?"
              class="task-input"
              @keyup.enter="createTask"
              autofocus
            />
          </div>
          <div class="form-group">
            <label>Assign To</label>
            <select v-model="newTaskAssignee" class="task-input">
              <option value="">Unassigned</option>
              <option v-for="member in assignableMembers" :key="member.id" :value="member.id">
                {{ member.isAI ? '🤖 ' : '' }}{{ member.username }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showTaskDialog = false" class="btn btn-ghost">Cancel</button>
          <button @click="createTask" :disabled="!newTaskTitle.trim()" class="btn btn-primary">
            Create Task
          </button>
        </div>
      </div>
    </div>

    <!-- Room Settings -->
    <div v-if="showRoomSettings" class="modal-overlay" @click.self="showRoomSettings = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Room Settings</h3>
          <button @click="showRoomSettings = false" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Room Name</label>
            <input
              v-model="roomName"
              type="text"
              class="task-input"
              placeholder="Room name"
              maxlength="100"
            />
          </div>
          <div class="form-group">
            <label>Custom AI Instructions</label>
            <textarea
              v-model="customInstructions"
              rows="4"
              class="task-input"
              placeholder="Describe how the AI should behave in this room..."
            ></textarea>
          </div>
          <div class="form-group danger-zone">
            <label>Danger Zone</label>
            <p class="danger-desc">Deleting the room will remove messages, tasks, and documents.</p>
            <button class="btn btn-danger" @click="deleteRoom">Delete Room</button>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="showRoomSettings = false" class="btn btn-ghost">Cancel</button>
          <button @click="saveRoomSettings" class="btn btn-primary">Save</button>
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
  border-radius: 14px;
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

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 6px var(--success);
}

.status-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.room-header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

/* Online Avatars */
.online-avatars {
  display: flex;
  align-items: center;
}

.online-avatar-mini {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--surface-elevated);
  border: 2px solid var(--background);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-left: -8px;
  position: relative;
  transition: all 0.2s ease;
}

.online-avatar-mini:first-child {
  margin-left: 0;
}

.online-avatar-mini.is-online {
  border-color: var(--success);
  color: var(--text-primary);
}

.online-avatar-mini.is-online::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 8px;
  height: 8px;
  background: var(--success);
  border: 2px solid var(--background);
  border-radius: 50%;
}

.online-avatar-more {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--primary-soft);
  border: 2px solid var(--background);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--primary);
  margin-left: -8px;
}

.status-separator {
  color: var(--text-muted);
  margin: 0 var(--space-1);
}

.online-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.online-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--success);
}

.btn-ghost {
  background: transparent;
  border: 1px solid transparent;
  color: var(--text-secondary);
}

.btn-ghost:hover {
  background: var(--surface);
  color: var(--text-primary);
}

.btn-danger {
  background: var(--danger);
  color: white;
  border: none;
}

.btn-danger:hover {
  background: #b91c1c;
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
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
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
  color: var(--primary);
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
  gap: var(--space-2);
  animation: messageSlideIn 0.3s ease;
  opacity: 0;
  animation-fill-mode: forwards;
  border-radius: var(--radius-lg);
  padding: var(--space-1) var(--space-2);
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
  border-radius: 12px;
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

.message.active {
  background: var(--surface);
  border: 1px solid var(--primary-muted);
  box-shadow: var(--shadow-sm);
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

.message-body a {
  color: var(--primary);
  text-decoration: underline;
}

/* Highlight for @mentions in message bubbles */
.mention-highlight {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 600;
}

/* Highlight for /commands in message bubbles */
.command-highlight {
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.1);
  padding: 1px 4px;
  border-radius: 4px;
  font-weight: 600;
}

.message-body code {
  background: var(--surface);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
    monospace;
}

.message-body pre {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.4;
  margin: 0.75rem 0;
}

.message-body ul,
.message-body ol {
  padding-left: 1.25rem;
  margin: 0.5rem 0;
}

.message:hover .message-body {
  border-color: var(--primary);
  box-shadow: 0 8px 24px rgba(37, 99, 235, 0.15);
  transform: translateY(-1px);
}

.message-ai .message-body {
  background: linear-gradient(135deg, rgba(0, 127, 255, 0.05), rgba(0, 127, 255, 0.02));
  border-color: rgba(0, 127, 255, 0.2);
}

.message-human .message-body {
  background: linear-gradient(135deg, rgba(51, 65, 85, 0.05), rgba(51, 65, 85, 0.02));
  border-color: rgba(51, 65, 85, 0.2);
}

.reply-preview {
  border-left: 3px solid var(--primary);
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  color: var(--text-muted);
  font-size: 0.85rem;
  background: var(--surface);
  border-radius: var(--radius-md);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.reply-label {
  font-weight: 700;
  margin-right: var(--space-2);
  color: var(--primary);
}

.message-actions {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-top: var(--space-2);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.message:hover .message-actions,
.message.active .message-actions {
  opacity: 1;
  pointer-events: auto;
}

.link-btn {
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 600;
  cursor: pointer;
  padding: 0;
}

.reactions {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  max-width: 100%;
  overflow: hidden;
}

.reaction-btn {
  border: 1px solid var(--border);
  background: var(--surface);
  border-radius: var(--radius-full);
  padding: 2px 6px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.reaction-btn:hover {
  background: var(--primary-muted);
  border-color: var(--primary-muted);
}

.reaction-count {
  color: var(--text-muted);
  font-size: 0.75rem;
}

/* Message Input - using the enhanced version at the bottom */

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

/* Side Panel */
.side-panel {
  width: 340px;
  border-left: 1px solid var(--border);
  background: var(--surface-elevated);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
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

.desktop-tabs {
  display: flex;
}

.mobile-tabs {
  display: none;
  position: relative;
}

.mobile-panel-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 20;
}

.mobile-hidden {
  display: none;
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
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
}

.panel-tab:hover {
  color: var(--text-primary);
  background: linear-gradient(135deg, var(--surface), var(--surface-elevated));
  transform: translateY(-1px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.06);
}

.panel-tab.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  background: var(--surface-elevated);
  box-shadow: inset 0 -2px 0 var(--primary-muted);
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
  color: var(--text-muted);
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
  color: var(--danger);
}

/* Responsive */
@media (max-width: 1024px) {
  .room-content {
    flex-direction: column;
  }

  .side-panel {
    display: block;
    width: 100%;
    max-height: 40vh;
    min-height: 200px;
    border-left: none;
    border-top: 1px solid var(--border);
    order: 2;
  }

  .chat-panel {
    order: 1;
    flex: 1;
    min-height: 0;
  }

  .panel-tabs {
    position: sticky;
    top: 0;
    z-index: 5;
    background: var(--surface-elevated);
  }

  .desktop-tabs {
    display: none;
  }

  .mobile-tabs {
    display: flex;
  }

  .room-header {
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: var(--space-3) var(--space-4);
  }

  .room-header-info h2 {
    font-size: 1.05rem;
  }

  .room-header-actions {
    width: 100%;
    justify-content: space-between;
  }

  .task-board {
    flex-direction: column;
  }

  .task-column {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .room-header {
    padding: 0.65rem 1rem;
    margin-top: 2.5rem; /* Space for mobile menu button */
  }

  .room-avatar-sm {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    font-size: 0.8rem;
  }

  .room-title {
    font-size: 1rem;
  }

  .room-status-bar {
    font-size: 0.7rem;
  }

  .messages-container {
    padding: 0.5rem 0.75rem;
    gap: 0.25rem;
  }

  .message {
    gap: 0.5rem;
    padding: var(--space-1) var(--space-2);
  }

  .message-avatar {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    font-size: 0.75rem;
  }

  .message-body {
    padding: 0.75rem;
    font-size: 0.9rem;
  }

  .message-input-container {
    padding: 0.75rem 1rem;
    padding-bottom: calc(0.75rem + env(safe-area-inset-bottom, 0));
    position: sticky;
    bottom: 0;
    background: var(--surface-elevated);
    border-top: 1px solid var(--border);
  }

  .message-input-wrapper {
    padding: var(--space-2);
    border-radius: var(--radius-lg);
  }

  .message-input {
    padding: var(--space-2) var(--space-3);
    font-size: 16px; /* Prevent iOS zoom */
  }

  .send-btn {
    width: 40px;
    height: 40px;
  }

  .side-panel {
    max-height: 35vh;
  }

  .panel-content {
    padding: var(--space-3);
  }

  .panel-header h3 {
    font-size: 0.9rem;
  }

  .task-card {
    padding: var(--space-2);
  }

  .task-card-footer {
    flex-direction: column;
    gap: var(--space-2);
  }

  .task-assignee {
    width: 100%;
  }

  .task-controls {
    width: 100%;
  }

  .assignee-select,
  .task-status-select {
    width: 100%;
    font-size: 14px;
    padding: 6px 10px;
  }

  .task-card-actions {
    justify-content: flex-start;
    margin-top: var(--space-2);
  }

  .chip-btn {
    padding: 8px 12px;
    font-size: 0.8rem;
    min-height: 36px; /* Touch-friendly */
  }

  .modal-overlay {
    padding: 0.5rem;
    align-items: flex-end;
  }

  .modal-content {
    border-radius: var(--radius-xl) var(--radius-xl) 0 0;
    max-height: 90vh;
    overflow-y: auto;
    padding-bottom: env(safe-area-inset-bottom, 0);
  }

  .modal-body {
    padding: var(--space-4);
  }

  .task-input {
    font-size: 16px; /* Prevent iOS zoom */
  }

  .mention-menu,
  .command-menu {
    left: var(--space-3);
    right: var(--space-3);
    bottom: 70px;
    max-height: 180px;
  }

  .online-avatars {
    display: none;
  }

  .reactions {
    gap: 4px;
  }

  .reaction-btn {
    padding: 4px 6px;
    font-size: 0.75rem;
  }

  .doc-upload-area {
    padding: var(--space-4);
  }

  .doc-item {
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .doc-item-actions {
    width: 100%;
    margin-top: var(--space-2);
  }
}

@media (max-width: 480px) {
  .room-header-info {
    gap: var(--space-2);
  }

  .room-header-actions {
    gap: var(--space-2);
  }

  .btn-ghost.btn-sm {
    font-size: 0.75rem;
    padding: 0.4rem 0.6rem;
  }

  .side-panel {
    max-height: 30vh;
  }

  .panel-tab {
    padding: var(--space-2);
    font-size: 0.8rem;
  }

  .kb-section {
    padding: var(--space-3);
  }

  .kb-summary-text {
    font-size: 0.85rem;
  }
}

/* Task list */
.task-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.task-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--surface);
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.task-item:hover {
  background: var(--surface-elevated);
  transform: translateX(2px);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: var(--text-muted);
}

.task-item input[type='checkbox'] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.task-title {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.completed-section {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--border);
}

.completed-section h4 {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: var(--space-3);
}

/* Knowledge Base */
.kb-panel-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.kb-section {
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  border: 1px solid var(--border);
}

.kb-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.kb-section h4 {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.kb-summary-text {
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

.kb-edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.kb-textarea {
  width: 100%;
  padding: var(--space-3);
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 0.9rem;
  resize: vertical;
  font-family: inherit;
}

.kb-textarea:focus {
  outline: none;
  border-color: var(--primary);
}

.kb-edit-actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.kb-add-form {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
  flex-wrap: wrap;
}

.kb-link-form,
.kb-resource-form {
  flex-direction: column;
}

.kb-input {
  flex: 1;
  min-width: 120px;
  padding: var(--space-2) var(--space-3);
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.85rem;
}

.kb-input:focus {
  outline: none;
  border-color: var(--primary);
}

.chip-btn-primary {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
}

.chip-btn-primary:hover {
  background: var(--primary-soft);
}

.kb-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.kb-list li {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--surface-elevated);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.kb-link {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  color: var(--primary);
  text-decoration: none;
  font-weight: 500;
}

.kb-link:hover {
  text-decoration: underline;
}

.kb-resource {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  color: var(--text-primary);
  text-decoration: none;
  width: 100%;
}

.kb-resource:hover {
  color: var(--primary);
}

.kb-resource-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.kb-resource-title {
  font-weight: 500;
}

.kb-resource-desc {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.kb-empty {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
}

.kb-content {
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: var(--space-4);
}

.kb-section h4 {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}

.kb-section p {
  font-size: 0.9rem;
  color: var(--text-primary);
  line-height: 1.6;
}

.goals-section {
  margin-top: var(--space-4);
}

.goals-section h4 {
  font-size: 0.85rem;
  color: var(--text-muted);
  margin-bottom: var(--space-2);
}

.goals-list {
  list-style: none;
  padding: 0;
}

.goals-list li {
  padding: var(--space-2) var(--space-3);
  background: var(--surface);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-2);
  font-size: 0.9rem;
}

/* Documents Panel */
.documents-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.docs-panel-body {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  flex: 1;
  overflow-y: auto;
}

.doc-upload-section {
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  border: 1px solid var(--border);
}

.doc-upload-area {
  border: 2px dashed var(--border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  text-align: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.doc-upload-area:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  color: var(--text-muted);
}

.upload-placeholder p {
  margin: 0;
  font-size: 0.85rem;
}

.doc-upload-progress {
  margin-top: var(--space-3);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: var(--surface-elevated);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--primary);
  transition: width 0.3s ease;
}

.doc-search-section {
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: var(--space-3);
  border: 1px solid var(--border);
}

.doc-search-input {
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-size: 0.85rem;
}

.doc-search-input:focus {
  outline: none;
  border-color: var(--primary);
}

.doc-search-results {
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  border: 1px solid var(--border);
}

.doc-search-results h4 {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: var(--space-3);
  color: var(--text-primary);
}

.doc-result-item {
  padding: var(--space-3);
  background: var(--surface-elevated);
  border-radius: var(--radius-sm);
  margin-bottom: var(--space-2);
}

.doc-result-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.doc-result-filename {
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.doc-result-score {
  margin-left: auto;
  font-size: 0.75rem;
  color: var(--text-muted);
  background: var(--primary-soft);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.doc-result-content {
  font-size: 0.8rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin: 0;
}

.doc-list {
  background: var(--surface);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  border: 1px solid var(--border);
  flex: 1;
}

.doc-list h4 {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: var(--space-3);
  color: var(--text-primary);
}

.doc-items {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.doc-item {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
  background: var(--surface-elevated);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.doc-item:hover {
  background: linear-gradient(135deg, var(--surface), var(--surface-elevated));
  border: 1px solid var(--primary);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.12);
}

.doc-item-icon {
  color: var(--primary);
}

.doc-item-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.doc-item-name {
  font-weight: 500;
  font-size: 0.85rem;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.doc-item-meta {
  font-size: 0.75rem;
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.doc-processing {
  color: var(--warning);
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.doc-ready {
  color: var(--success);
}

.doc-failed {
  color: var(--error);
}

.doc-empty {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
  margin: 0;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: var(--surface-elevated);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 500px;
  box-shadow: var(--shadow-xl);
  animation: slideInUp 0.3s ease;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4);
  border-bottom: 1px solid var(--border);
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--surface);
  color: var(--text-primary);
}

.modal-body {
  padding: var(--space-6);
}

.task-input {
  width: 100%;
  padding: var(--space-3);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  font-size: 1rem;
  transition: all 0.2s ease;
}

.task-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(var(--primary-rgb), 0.1);
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
  padding: var(--space-4);
  border-top: 1px solid var(--border);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Task Board Styles */
.task-board {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.task-column {
  background: linear-gradient(135deg, var(--surface), var(--surface-elevated));
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  border: 1px solid var(--border);
  box-shadow: var(--shadow-sm);
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--border);
}

.column-title {
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--text-primary);
}

.column-count {
  background: var(--primary-muted);
  color: var(--primary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
}

.task-card {
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: var(--space-3);
  margin-bottom: var(--space-2);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-xs);
}

.task-card:hover {
  border-color: var(--primary-muted);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.task-card.in-progress {
  border-left: 3px solid var(--warning);
  background: linear-gradient(135deg, rgba(234, 179, 8, 0.06), var(--surface-elevated));
}

.task-card.done {
  opacity: 0.7;
  border-left: 3px solid var(--success);
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.06), var(--surface-elevated));
}

.task-card.done .task-title {
  text-decoration: line-through;
  color: var(--text-muted);
}

.task-card-header {
  margin-bottom: var(--space-2);
}

.task-card-footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.task-assignee {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.assignee-avatar {
  width: 24px;
  height: 24px;
  background: var(--surface);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
}

.assignee-name {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.task-status-select {
  padding: 4px 8px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.75rem;
  cursor: pointer;
}

.task-status-select:focus {
  outline: none;
  border-color: var(--primary);
}

.task-card-actions {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  justify-content: flex-end;
}

.chip-btn {
  border: 1px solid var(--border);
  background: var(--surface);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.75rem;
  transition: all 0.15s ease;
}

.chip-btn:hover {
  background: var(--primary-muted);
  color: var(--primary);
  border-color: var(--primary-muted);
  box-shadow: var(--shadow-xs);
}

.chip-btn.danger {
  color: var(--danger);
  border-color: var(--danger-muted, var(--border));
}

.chip-btn.danger:hover {
  background: rgba(239, 68, 68, 0.08);
  border-color: var(--danger);
}

.danger-zone {
  border: 1px solid var(--danger);
  padding: var(--space-3);
  border-radius: var(--radius-md);
  background: rgba(239, 68, 68, 0.05);
}

.danger-desc {
  color: var(--text-muted);
  margin-bottom: var(--space-2);
  font-size: 0.85rem;
}

.task-title-wrap {
  flex: 1;
  display: flex;
  align-items: center;
}

.task-edit-input {
  width: 100%;
  padding: 6px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
}

.assignee-control {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.assignee-label {
  font-size: 0.7rem;
  color: var(--text-muted);
}

.assignee-select {
  min-width: 140px;
}

.task-controls {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 160px;
}

.task-list {
  min-height: 60px;
  padding-bottom: var(--space-2);
}

.task-list:empty::after {
  content: 'Drop tasks here';
  display: block;
  text-align: center;
  color: var(--text-muted);
  padding: var(--space-4);
  border: 1px dashed var(--border);
  border-radius: var(--radius-md);
}

.task-column:nth-child(1) .column-title {
  color: var(--primary);
}
.task-column:nth-child(2) .column-title {
  color: var(--warning);
}
.task-column:nth-child(3) .column-title {
  color: var(--success);
}

.empty-column {
  text-align: center;
  padding: var(--space-4);
  color: var(--text-muted);
  font-size: 0.85rem;
}

/* Mention Menu Styles */
.mention-menu {
  position: absolute;
  bottom: 80px;
  left: var(--space-6);
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 200px;
  overflow-y: auto;
  z-index: 100;
  min-width: 200px;
  animation: slideInUp 0.2s ease;
}

.mention-header {
  padding: var(--space-2) var(--space-3);
  font-size: 0.75rem;
  color: var(--text-muted);
  border-bottom: 1px solid var(--border);
  font-weight: 500;
}

.mention-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  cursor: pointer;
  transition: background 0.15s ease;
}

.mention-item:hover {
  background: var(--surface);
}

.mention-item.active {
  background: var(--surface);
  border-left: 3px solid var(--primary);
}

.mention-avatar {
  width: 28px;
  height: 28px;
  background: var(--primary-muted);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--primary);
}

.mention-avatar.mention-ai {
  background: linear-gradient(135deg, var(--accent), var(--accent-soft));
  color: white;
}

.mention-name {
  flex: 1;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.mention-badge {
  background: var(--accent-muted);
  color: var(--accent);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  font-size: 0.65rem;
  font-weight: 600;
}

.mention-empty {
  padding: var(--space-3);
  text-align: center;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.command-menu {
  position: absolute;
  bottom: 80px;
  left: var(--space-6);
  background: var(--surface-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  max-height: 220px;
  overflow-y: auto;
  z-index: 100;
  min-width: 240px;
  animation: slideInUp 0.2s ease;
}

.command-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.command-description {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Form Group */
.form-group {
  margin-bottom: var(--space-4);
}

.form-group label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  margin-bottom: var(--space-2);
}

.message-input-container {
  position: relative;
  padding: var(--space-4) var(--space-6);
  background: var(--surface-elevated);
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.ai-thinking {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.8rem;
  color: var(--text-muted);
  font-size: 0.85rem;
}

.dot-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  display: inline-block;
  animation: pulse 1.2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.8);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: scale(0.8);
    opacity: 0.8;
  }
}

.replying-pill {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
}

.replying-label {
  font-weight: 700;
  color: var(--primary);
}

.replying-text {
  flex: 1;
  color: var(--text-secondary);
  font-size: 0.85rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.messages-container:focus {
  outline: 2px solid var(--primary-muted);
}

/* Compact document items in KB panel */
.kb-documents-section {
  margin-top: var(--space-4);
  border-top: 1px solid var(--border);
  padding-top: var(--space-4);
}

.kb-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.btn-xs {
  padding: 4px 8px;
  font-size: 0.7rem;
}

.doc-items.compact {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.doc-item-compact {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--surface);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  font-size: 0.8rem;
}

.doc-item-compact .doc-item-name {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--text-secondary);
}

.chip-btn-xs {
  padding: 4px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chip-btn-xs:hover {
  background: var(--danger-muted, rgba(239, 68, 68, 0.1));
  color: var(--danger);
}

.doc-empty-small {
  font-size: 0.8rem;
  color: var(--text-muted);
  padding: var(--space-2) 0;
}

/* Mobile panel toggle */
.mobile-toggle {
  display: none;
}

.side-panel.mobile-hidden {
  display: block;
}

@media (max-width: 1024px) {
  .mobile-toggle {
    display: inline-flex;
  }

  .side-panel.mobile-hidden {
    display: none;
  }
}
</style>
