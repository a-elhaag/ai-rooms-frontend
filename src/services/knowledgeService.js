import apiClient from '@/api'

export default {
  async getRoomGoals(roomId) {
    const response = await apiClient.get(`/rooms/${roomId}/goals`)
    return response.data
  },

  async createGoal(roomId, goalData) {
    // goalData: { title, description?, priority?, target_date? }
    const response = await apiClient.post(`/rooms/${roomId}/goals`, goalData)
    return response.data
  },

  async updateGoal(goalId, goalData) {
    // goalData: { title?, description?, priority?, target_date?, status? }
    const response = await apiClient.put(`/goals/${goalId}`, goalData)
    return response.data
  },

  async getRoomKB(roomId) {
    const response = await apiClient.get(`/rooms/${roomId}/kb`)
    return response.data
  },

  async updateRoomKB(roomId, kbData) {
    // kbData: { summary?, key_decisions?, important_links?, resources? }
    const response = await apiClient.put(`/rooms/${roomId}/kb`, kbData)
    return response.data
  },
}
