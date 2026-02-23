import api from '@/lib/api';

export interface HospitalSetting {
  id: number;
  hospital_name: string;
  address?: string;
  contact_number?: string;
  hospital_logo?: string;
  max_weekly_hours: number;
  created_at: string;
  updated_at: string;
}

export const hospitalSettingService = {
  async get(): Promise<HospitalSetting> {
    const response = await api.get('/hospital-settings');
    return response.data.data;
  },

  async update(data: Partial<HospitalSetting>): Promise<HospitalSetting> {
    const response = await api.put('/hospital-settings', data);
    return response.data.data;
  },
};
