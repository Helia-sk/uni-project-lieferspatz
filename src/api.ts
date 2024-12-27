import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:5050/', // Flask backend URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;
