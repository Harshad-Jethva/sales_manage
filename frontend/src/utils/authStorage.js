export const getContextPrefix = () => {
  if (typeof window === 'undefined') {
    return '';
  }

  const params = new URLSearchParams(window.location.search);
  let contextId = params.get('context_id');

  if (contextId) {
    window.name = `ctx_${contextId}`;
  } else if (typeof window.name === 'string' && window.name.startsWith('ctx_')) {
    contextId = window.name.slice(4);
  }

  if (contextId) {
    return `${contextId}_`;
  }

  if (window.self !== window.top) {
    return 'iframe_';
  }

  return '';
};

export const getContextKeys = () => {
  const prefix = getContextPrefix();
  return {
    token: `${prefix}token`,
    user: `${prefix}user`,
  };
};

export const getStoredToken = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  const keys = getContextKeys();
  const contextToken = sessionStorage.getItem(keys.token);
  if (contextToken) {
    return contextToken;
  }

  const rootToken = sessionStorage.getItem('token');
  if (rootToken) {
    return rootToken;
  }

  const tokenKey = Object.keys(sessionStorage).find((key) => key.endsWith('_token'));
  return tokenKey ? sessionStorage.getItem(tokenKey) : null;
};

export const getAuthHeader = () => {
  const token = getStoredToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};
