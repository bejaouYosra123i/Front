import axios from 'axios';
import { API_URL } from '../config';

export interface RequestData {
  fullName: string;
  department: string;
  function: string;
  pcType: string;
  reason: string;
  requestedBy: string;
  signatures: Record<string, string>;
}

export const requestService = {
  async submitRequest(data: RequestData) {
    const response = await axios.post(`${API_URL}/api/PcRequest/requests`, data);
    return response.data;
  },
  async getAllRequests() {
    const response = await axios.get(`${API_URL}/api/PcRequest/requests`);
    return response.data;
  },
  async updateStatus(id: number, status: string) {
    const token = localStorage.getItem('accessToken');
    try {
      const response = await axios.patch(
        `${API_URL}/api/PcRequest/requests/${id}/status`,
        { status },
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error("Erreur Axios dans updateStatus:", error);
      throw error;
    }
  },
}; 