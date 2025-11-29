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

  async appendToKB(roomId, appendData) {
    // appendData: { key_decision?, important_link?, resource?: { title, url?, description?, category? } }
    const response = await apiClient.post(`/rooms/${roomId}/kb/append`, appendData)
    return response.data
  },

  // Add a key decision to KB
  async addDecision(roomId, decision) {
    const response = await apiClient.post(`/rooms/${roomId}/kb/decisions`, { decision })
    return response.data
  },

  // Add an important link to KB
  async addLink(roomId, link) {
    // link: { title, url }
    const response = await apiClient.post(`/rooms/${roomId}/kb/links`, link)
    return response.data
  },

  // Add a resource to KB
  async addResource(roomId, resource) {
    // resource: { title, url, description? }
    const response = await apiClient.post(`/rooms/${roomId}/kb/resources`, resource)
    return response.data
  },

  async removeResource(roomId, url) {
    const response = await apiClient.post(`/rooms/${roomId}/kb/remove`, {
      item_type: 'resource',
      value: url,
    })
    return response.data
  },
}
