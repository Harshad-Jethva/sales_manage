const fallbackApi = 'http://localhost/sales_manage/backend/api';

export const API_BASE_URL = (import.meta.env.VITE_API_URL || fallbackApi).replace(/\/+$/, '');

export const buildApiUrl = (path) => `${API_BASE_URL}/${String(path || '').replace(/^\/+/, '')}`;
