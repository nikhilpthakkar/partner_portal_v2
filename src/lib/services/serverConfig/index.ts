export const getDomainOrigin = () => {
  try {
    if (typeof window !== 'undefined') {
      if (window.location.hostname === 'localhost') {
        return 'http://localhost:9001';
      }
      return window.location.origin;
    }
  } catch (e) {
    console.error('domain error ', e);
    return window.location.origin;
  }
};
