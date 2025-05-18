import axiosInstance from '../utils/axiosInstance';

export const investmentItemService = {
  async updateItem(id: number, data: any) {
    const response = await axiosInstance.put(`/InvestmentItem/${id}`, data);
    return response.data;
  },

  async deleteItem(id: number) {
    const response = await axiosInstance.delete(`/InvestmentItem/${id}`);
    return response.data;
  },

  async updateTracking(id: number, trackingData: {
    coupaNumber: string;
    rytmNumber: string;
    ioNumber: string;
    iyrasNumber: string;
  }) {
    const response = await axiosInstance.put(`/InvestmentItem/${id}/tracking`, trackingData);
    return response.data;
  }
}; 