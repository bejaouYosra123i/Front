import axios from 'axios';
import * as XLSX from 'xlsx';

const API_URL = import.meta.env.VITE_API_URL;

export interface RequestData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  department: string;
}

export const requestService = {
  async submitRequest(data: RequestData) {
    const response = await axios.post(`${API_URL}/requests`, data);
    return response.data;
  },

  async downloadExcel() {
    try {
      const response = await axios.get(`${API_URL}/requests/export`, {
        responseType: 'blob'
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      
      // Create a download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `requests_${new Date().toISOString().split('T')[0]}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading Excel file:', error);
      throw error;
    }
  }
}; 