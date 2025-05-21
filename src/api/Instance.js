import axios from 'axios';

const Instance = axios.create({
  // baseURL: 'https://pathology-server.onrender.com/',
  // baseURL: 'http://192.168.115.164:5000/',
  baseURL: 'https://medisewa.onrender.com/',
});

export {Instance};
