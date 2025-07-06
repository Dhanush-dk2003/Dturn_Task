import axios from 'axios';

const API = axios.create({
  baseURL: 'https://dturn-backend.onrender.com/api',
  withCredentials: true // Important for cookies
});

export default API;
