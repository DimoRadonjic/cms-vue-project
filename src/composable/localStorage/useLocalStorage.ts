export const useSessionStorage = () => {
  const getItem = <T>(key: string): T | null => {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  };

  const setItem = <T>(key: string, value: T): void => {
    sessionStorage.setItem(key, JSON.stringify(value));
  };

  const removeItem = (key: string): void => {
    sessionStorage.removeItem(key);
  };

  const clearStorage = () => {
    sessionStorage.clear();
  };

  return {
    getItem,
    setItem,
    removeItem,
    clearStorage,
  };
};
