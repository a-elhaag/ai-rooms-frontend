import apiClient from '@/api'

export default {
  async getUserRooms() {
    const response = await apiClient.get('/rooms')
    return response.data
  },

  async createRoom(roomData) {
    // roomData: { name }
    const response = await apiClient.post('/rooms', roomData)
    return response.data
  },

  async joinRoom(joinData) {
    // joinData: { join_code }
    const response = await apiClient.post('/rooms/join', joinData)
    return response.data
  },

  async getRoomMembers(roomId) {
    const response = await apiClient.get(`/rooms/${roomId}/members`)
    return response.data
  },

  async getRoomMessages(roomId, params = {}) {
    // params: { limit, before }
    const response = await apiClient.get(`/rooms/${roomId}/messages`, { params })
    return response.data
  },

  async sendMessage(roomId, messageData) {
    // messageData: { content, type }
    const response = await apiClient.post(`/rooms/${roomId}/messages`, messageData)
    return response.data
  },
}
