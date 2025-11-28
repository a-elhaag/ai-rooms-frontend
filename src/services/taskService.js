import apiClient from '@/api'

export default {
  async getAllTasks() {
    // Get all tasks from all rooms the user is a member of
    const response = await apiClient.get('/tasks')
    return response.data
  },

  async getRoomTasks(roomId) {
    const response = await apiClient.get(`/rooms/${roomId}/tasks`)
    return response.data
  },

  async createTask(roomId, taskData) {
    // taskData: { title, description?, assignee_id?, due_date?, priority? }
    const response = await apiClient.post(`/rooms/${roomId}/tasks`, taskData)
    return response.data
  },

  async updateTask(taskId, taskData) {
    // taskData: { title?, description?, status?, assignee_id?, due_date?, priority? }
    const response = await apiClient.patch(`/tasks/${taskId}`, taskData)
    return response.data
  },
}
