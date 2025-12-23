import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

let apiClient;

try {
  apiClient = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // for cookies
  });

  // Do not attach tokens from localStorage; rely on httpOnly cookies

  // Handle response errors
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      // Let callers handle 401s to avoid redirect loops on /login
      return Promise.reject(error);
    }
  );
} catch (error) {
  console.error('Failed to initialize axios:', error);
  // Create a dummy client that will throw helpful errors
  apiClient = {
    post: () => { throw new Error('Axios not properly initialized. Run: npm install axios'); },
    get: () => { throw new Error('Axios not properly initialized. Run: npm install axios'); },
    put: () => { throw new Error('Axios not properly initialized. Run: npm install axios'); },
    delete: () => { throw new Error('Axios not properly initialized. Run: npm install axios'); },
  };
}

export default apiClient;
