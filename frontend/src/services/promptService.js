import axios from 'axios';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const promptService = {
  /**
   * Fetch all prompts (list view — id, title, complexity, created_at)
   */
  getPrompts: async () => {
    const response = await api.get('/prompts');
    return response.data;
  },

  /**
   * Fetch a single prompt by ID (increments Redis view counter)
   */
  getPrompt: async (id) => {
    const response = await api.get(`/prompts/${id}`);
    return response.data;
  },

  /**
   * Create a new prompt
   */
  createPrompt: async (payload) => {
    const response = await api.post('/prompts', payload);
    return response.data;
  },
};