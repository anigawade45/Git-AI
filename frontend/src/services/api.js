const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export async function fetchApi(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      credentials: 'include',
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `API error: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    console.warn(
      `[API Client] ${endpoint} request failed: ${error.message}`
    );
    throw error;
  }
}
