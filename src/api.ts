import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5000/', // Flask backend URL
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default apiClient;
