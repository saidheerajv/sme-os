import axios from 'axios';
import type { Organization, OrganizationMember, InviteMemberDto, UpdateMemberRoleDto, CreateUserDto } from '../types/organization.types';

const API_BASE_URL = '/api';

export const organizationsApi = {
  // Get all organizations for the current user
  async getAll(): Promise<Organization[]> {
    const response = await axios.get(`${API_BASE_URL}/organizations`);
    return response.data;
  },

  // Get single organization by ID
  async getById(id: string): Promise<Organization> {
    const response = await axios.get(`${API_BASE_URL}/organizations/${id}`);
    return response.data;
  },

  // Get organization members
  async getMembers(id: string): Promise<OrganizationMember[]> {
    const response = await axios.get(`${API_BASE_URL}/organizations/${id}/members`);
    return response.data;
  },

  // Invite member to organization
  async inviteMember(id: string, data: InviteMemberDto): Promise<OrganizationMember> {
    const response = await axios.post(`${API_BASE_URL}/organizations/${id}/members`, data);
    return response.data;
  },

  // Create user in organization
  async createUser(id: string, data: CreateUserDto): Promise<OrganizationMember> {
    const response = await axios.post(`${API_BASE_URL}/organizations/${id}/users`, data);
    return response.data;
  },

  // Remove member from organization
  async removeMember(id: string, memberId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/organizations/${id}/members/${memberId}`);
  },

  // Update member role
  async updateMemberRole(id: string, memberId: string, data: UpdateMemberRoleDto): Promise<OrganizationMember> {
    const response = await axios.put(`${API_BASE_URL}/organizations/${id}/members/${memberId}`, data);
    return response.data;
  },
};
