import { fetchApi, BASE_URL } from './api';

export const authService = {
  async login(email, password) {
    const data = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data && data.user) {
      if (data.token) {
        localStorage.setItem('user_token', data.token);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async register(name, email, password) {
    const data = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    if (data && data.user) {
      if (data.token) {
        localStorage.setItem('user_token', data.token);
      }
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async forgotPassword(email) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      message: 'Password reset link sent to your email address.',
    };
  },

  async getGitHubAuthUrl() {
    try {
      const data = await fetchApi('/auth/github');
      return data.url || `${BASE_URL}/auth/github?redirect=true`;
    } catch (err) {
      return `${BASE_URL}/auth/github?redirect=true`;
    }
  },

  async updateProfile(profileData) {
    const data = await fetchApi('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    if (data && data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  async logout() {
    try {
      await fetchApi('/auth/logout', { method: 'POST' });
    } catch (err) {
      // Ignore API logout error
    }
    localStorage.removeItem('user');
    localStorage.removeItem('user_token');
    return { success: true };
  },
};


