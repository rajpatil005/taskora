const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const apiCall = async (
  endpoint: string,
  options: {
    method?: string;
    body?: any;
    token?: string;
  } = {}
) => {
  const { method = 'GET', body, token } = options;

  const headers: any = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    method,
    headers
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || `API error: ${response.status}`);
  }

  return data;
};

export const getStoredToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('taskora_token');
  }
  return null;
};
