export const useStorage = () => {
  const getSessionItem = <T>(key: string): T | null => {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  };

  const getLocalItem = <T>(key: string): T | null => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  };

  const setLocalItem = <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const removeLocalItem = (key: string): void => {
    localStorage.removeItem(key);
  };

  const setSessionItem = <T>(key: string, value: T): void => {
    sessionStorage.setItem(key, JSON.stringify(value));
  };

  const removeSessionItem = (key: string): void => {
    sessionStorage.removeItem(key);
  };

  const clearSessionStorage = () => {
    sessionStorage.clear();
  };

  const clearStorage = () => {
    sessionStorage.clear();
    localStorage.clear();
  };

  return {
    getSessionItem,
    setSessionItem,
    removeSessionItem,
    clearStorage,
    clearSessionStorage,
    getLocalItem,
    removeLocalItem,
    setLocalItem,
  };
};
