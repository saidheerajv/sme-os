import axios from 'axios';
import type { EntityDefinition, CreateEntityDefinitionDto } from '../types/entity.types';

const API_BASE_URL = '/api';

export const entityDefinitionsApi = {
  // Get all entity definitions
  async getAll(): Promise<EntityDefinition[]> {
    const response = await axios.get(`${API_BASE_URL}/entity-definitions`);
    return response.data;
  },

  // Get single entity definition by name
  async getByName(name: string): Promise<EntityDefinition> {
    const response = await axios.get(`${API_BASE_URL}/entity-definitions/${name}`);
    return response.data;
  },

  // Create new entity definition
  async create(data: CreateEntityDefinitionDto): Promise<EntityDefinition> {
    const response = await axios.post(`${API_BASE_URL}/entity-definitions`, data);
    return response.data;
  },

  // Update entity definition
  async update(name: string, data: CreateEntityDefinitionDto): Promise<EntityDefinition> {
    const response = await axios.put(`${API_BASE_URL}/entity-definitions/${name}`, data);
    return response.data;
  },

  // Delete entity definition
  async delete(name: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/entity-definitions/${name}`);
  },
};