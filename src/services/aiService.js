import apiClient from '@/api'

export default {
  async chatWithAI(roomId, message) {
    // AI chat endpoint - AI auto-detects what to do
    const response = await apiClient.post('/ai/chat', {
      room_id: roomId,
      message: message,
    })
    return response.data
  },

  async rephraseText(text, style = 'professional') {
    const response = await apiClient.post('/ai/rephrase', {
      text: text,
      style: style,
    })
    return response.data
  },

  async translateText(text, targetLanguage) {
    const response = await apiClient.post('/ai/translate', {
      text: text,
      target_language: targetLanguage,
    })
    return response.data
  },

  async summarizeRoom(roomId, lastNMessages = 20) {
    const response = await apiClient.post('/ai/summarize-room', {
      room_id: roomId,
      last_n_messages: lastNMessages,
    })
    return response.data
  },

  async updateKnowledgeBase(roomId, data) {
    const response = await apiClient.post('/ai/update-kb', {
      room_id: roomId,
      ...data,
    })
    return response.data
  },
}
