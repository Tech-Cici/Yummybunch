import { apiClient } from '@/lib/api-client';

export const restaurantApi = {
    getRestaurantByUserId: async (userId: number) => {
        try {
            const response = await apiClient.get(`/api/restaurants/by-user/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            throw error;
        }
    },

    getRestaurantById: async (id: number) => {
        try {
            const response = await apiClient.get(`/api/restaurants/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching restaurant:', error);
            throw error;
        }
    }
}; 