// API client for connecting to the backend
import axios from 'axios';

// Create an API client using axios
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API service for Items
export const itemsApi = {
  // Get all items
  getAll: async () => {
    const response = await apiClient.get('/items');
    return response.data;
  },
  
  // Get a single item by ID
  getById: async (id) => {
    const response = await apiClient.get(`/items/${id}`);
    return response.data;
  },
  
  // Create a new item
  create: async (item) => {
    const response = await apiClient.post('/items', item);
    return response.data;
  },
  
  // Update an item
  update: async (id, item) => {
    const response = await apiClient.put(`/items/${id}`, item);
    return response.data;
  },
  
  // Delete an item
  delete: async (id) => {
    const response = await apiClient.delete(`/items/${id}`);
    return response.data;
  }
};

// API service for Stock
export const stockApi = {
  // Get all batches with optional filters
  getBatches: async (filters = {}) => {
    const response = await apiClient.get('/stock/batches', { params: filters });
    return response.data;
  },
  
  // Get batches that are expiring soon
  getExpiringBatches: async (days = 30) => {
    const response = await apiClient.get('/stock/expiring', { params: { days } });
    return response.data;
  },
  
  // Get all stock movements with optional filters
  getMovements: async (filters = {}) => {
    const response = await apiClient.get('/stock/movements', { params: filters });
    return response.data;
  },
  
  // Receive new stock
  receiveStock: async (receiveData) => {
    const response = await apiClient.post('/stock/receive', receiveData);
    return response.data;
  },
  
  // Issue stock from a batch
  issueStock: async (issueData) => {
    const response = await apiClient.post('/stock/issue', issueData);
    return response.data;
  },
  
  // Adjust stock quantity
  adjustStock: async (adjustData) => {
    const response = await apiClient.post('/stock/adjust', adjustData);
    return response.data;
  },
  
  // Write off stock
  writeOffStock: async (data) => {
    const response = await apiClient.post('/stock/write-off', data);
    return response.data;
  },
  
  // Get a single batch by ID
  getBatchById: async (id) => {
    const response = await apiClient.get(`/stock/batches/${id}`);
    return response.data;
  },
  
  // Get movement summary by period
  getMovementSummary: async (period = 'day', startDate, endDate) => {
    const response = await apiClient.get('/stock/summary', { 
      params: { period, startDate, endDate } 
    });
    return response.data;
  }
};

export default {
  items: itemsApi,
  stock: stockApi
};