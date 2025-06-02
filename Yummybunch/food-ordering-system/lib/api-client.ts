import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add request interceptor to include auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
  role: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: string;
  phoneNumber?: string;
  restaurantName?: string;
  address?: string;
  phone?: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    throw new Error('No access token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

// Add methods to the axios instance
apiClient.testConnection = async (): Promise<ApiResponse<{ status: string }>> => {
  try {
    const response = await apiClient.get('/health');
    return response.data;
  } catch (error) {
    console.error('API connection error:', error);
    throw error;
  }
};

apiClient.login = async (credentials: LoginCredentials): Promise<ApiResponse<{ 
  id: string;
  email: string;
  name: string;
  role: string;
  accessToken: string;
}>> => {
  try {
    console.log('Attempting login with credentials:', { ...credentials, password: '***' });
    
    const requestBody = {
      email: credentials.email,
      password: credentials.password,
      role: credentials.role
    };

    console.log('Sending request body:', { ...requestBody, password: '***' });

    const response = await apiClient.post('/auth/login', requestBody);
    console.log('Login successful, received data:', { ...response.data, accessToken: '***' });
    return { data: response.data };
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.response?.status === 403) {
      return { error: 'Access denied. Please check your credentials and role.' };
    }
    return { error: error.response?.data?.message || 'Failed to connect to server' };
  }
};

apiClient.register = async (data: RegisterData, endpoint: string = '/auth/register'): Promise<ApiResponse<{
  id: string;
  email: string;
  name: string;
  role: string;
}>> => {
  try {
    const response = await apiClient.post(endpoint, data);
    return { data: response.data };
  } catch (error: any) {
    console.error('Registration error:', error);
    return { error: error.response?.data?.message || 'Failed to connect to server' };
  }
};

apiClient.getRestaurants = async () => {
  try {
    const response = await apiClient.get('/restaurants');
    return response.data;
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

apiClient.getRestaurant = async (id: string) => {
  try {
    const response = await apiClient.get(`/api/menus/restaurant/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching restaurant:', error);
    throw new Error(error.response?.data?.message || `Failed to fetch restaurant: ${error.response?.status}`);
  }
};

apiClient.getRestaurantMenu = async (restaurantId: string) => {
  try {
    const response = await apiClient.get(`/restaurants/${restaurantId}/menus`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching menu:', error);
    throw new Error(error.response?.data?.message || `Failed to fetch menu: ${error.response?.status}`);
  }
};

apiClient.updateRestaurantMenu = async (restaurantId: string, menu: any) => {
  try {
    const response = await apiClient.put(`/restaurants/${restaurantId}/menus`, menu);
    return response.data;
  } catch (error: any) {
    console.error('Error updating menu:', error);
    throw new Error(error.response?.data?.message || `Failed to update menu: ${error.response?.status}`);
  }
};

apiClient.createOrder = async (order: any) => {
  try {
    const response = await apiClient.post('/orders', order);
    return response.data;
  } catch (error: any) {
    console.error('Error creating order:', error);
    throw new Error(error.response?.data?.message || `Failed to create order: ${error.response?.status}`);
  }
};

apiClient.getOrders = async (userId: string) => {
  try {
    const response = await apiClient.get(`/orders/user`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching orders:', error);
    throw new Error(error.response?.data?.message || `Failed to fetch orders: ${error.response?.status}`);
  }
};

apiClient.updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const response = await apiClient.put(`/orders/${orderId}/status`, { status });
    return response.data;
  } catch (error: any) {
    console.error('Error updating order status:', error);
    throw new Error(error.response?.data?.message || `Failed to update order status: ${error.response?.status}`);
  }
};

apiClient.uploadImage = async (file: File) => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error('Error uploading image:', error);
    throw new Error(error.response?.data?.message || `Failed to upload image: ${error.response?.status}`);
  }
};

export { apiClient }; 