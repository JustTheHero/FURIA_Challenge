import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = {
  submitBasicInfo: (data) => {
    return axios.post(`${API_URL}/basic-info`, data);
  },
  
  submitPreferences: (data) => {
    return axios.post(`${API_URL}/preferences`, data);
  },
  
  verifyDocument: (documentData) => {
    return axios.post(`${API_URL}/verify-document`, documentData);
  },
  
  connectSocialProfile: (platform, token) => {
    return axios.post(`${API_URL}/connect-social`, { platform, token });
  },
  
  validateEsportsProfile: (profileUrl) => {
    return axios.post(`${API_URL}/validate-profile`, { profile_url: profileUrl });
  },
  
  generateFanProfile: () => {
    return axios.get(`${API_URL}/generate-profile`);
  },
  
  exportData: (format = 'json') => {
    return axios.get(`${API_URL}/export-data?format=${format}`);
  }
};

export default api;