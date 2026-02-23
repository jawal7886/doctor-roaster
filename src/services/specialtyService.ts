import api from '@/lib/api';

export interface Specialty {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const specialtyService = {
  async getAll(): Promise<Specialty[]> {
    const response = await api.get('/specialties');
    return response.data;
  },

  async getById(id: number): Promise<Specialty> {
    const response = await api.get(`/specialties/${id}`);
    return response.data;
  },

  async create(data: Partial<Specialty>): Promise<Specialty> {
    const response = await api.post('/specialties', data);
    return response.data.specialty;
  },

  async update(id: number, data: Partial<Specialty>): Promise<Specialty> {
    const response = await api.put(`/specialties/${id}`, data);
    return response.data.specialty;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/specialties/${id}`);
  },
};
