import apiClient from '@/api'

export default {
  // Upload a document (PDF or PowerPoint)
  async uploadDocument(roomId, file, onProgress = null) {
    const formData = new FormData()
    formData.append('file', file)

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }

    if (onProgress) {
      config.onUploadProgress = (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
        onProgress(percentCompleted)
      }
    }

    const response = await apiClient.post(`/rooms/${roomId}/documents`, formData, config)
    return response.data
  },

  // Get all documents for a room
  async getRoomDocuments(roomId) {
    const response = await apiClient.get(`/rooms/${roomId}/documents`)
    return response.data
  },

  // Search documents using semantic search
  async searchDocuments(roomId, query, limit = 5) {
    const response = await apiClient.post(`/rooms/${roomId}/documents/search`, null, {
      params: { query, limit },
    })
    return response.data
  },

  // Ask a question about documents (RAG)
  async askDocument(roomId, question, documentId = null) {
    const params = { question }
    if (documentId) {
      params.document_id = documentId
    }
    const response = await apiClient.post(`/rooms/${roomId}/documents/ask`, null, { params })
    return response.data
  },

  // Delete a document
  async deleteDocument(roomId, documentId) {
    const response = await apiClient.delete(`/rooms/${roomId}/documents/${documentId}`)
    return response.data
  },
}
