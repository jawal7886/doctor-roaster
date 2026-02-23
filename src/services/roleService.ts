import api from '@/lib/api';

export interface Role {
  id: number;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const roleService = {
  async getAll(): Promise<Role[]> {
    const response = await api.get('/roles');
    return response.data;
  },

  async getById(id: number): Promise<Role> {
    const response = await api.get(`/roles/${id}`);
    return response.data;
  },

  async create(data: Partial<Role>): Promise<Role> {
    const response = await api.post('/roles', data);
    return response.data.role;
  },

  async update(id: number, data: Partial<Role>): Promise<Role> {
    const response = await api.put(`/roles/${id}`, data);
    return response.data.role;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/roles/${id}`);
  },
};
