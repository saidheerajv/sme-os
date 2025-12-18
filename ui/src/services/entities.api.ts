import axios from 'axios';

const API_BASE_URL = '/api';

export interface EntityRecord {
  id: string;
  [key: string]: any;
}

export const entitiesApi = {
  // Get all records for an entity type
  async getAll(entityType: string): Promise<EntityRecord[]> {
    const response = await axios.get(`${API_BASE_URL}/entities/${entityType}`);
    return response.data;
  },

  // Get single record
  async getOne(entityType: string, id: string): Promise<EntityRecord> {
    const response = await axios.get(`${API_BASE_URL}/entities/${entityType}/${id}`);
    return response.data;
  },

  // Create new record
  async create(entityType: string, data: Record<string, any>): Promise<EntityRecord> {
    const response = await axios.post(`${API_BASE_URL}/entities/${entityType}`, data);
    return response.data;
  },

  // Update record
  async update(entityType: string, id: string, data: Record<string, any>): Promise<EntityRecord> {
    const response = await axios.put(`${API_BASE_URL}/entities/${entityType}/${id}`, data);
    return response.data;
  },

  // Delete record
  async delete(entityType: string, id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/entities/${entityType}/${id}`);
  },
};
