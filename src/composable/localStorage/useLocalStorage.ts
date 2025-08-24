export const useLocalStorage = () => {
  const getItem = <T>(key: string): T | null => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  };

  const setItem = <T>(key: string, value: T): void => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const removeItem = (key: string): void => {
    localStorage.removeItem(key);
  };

  const clearStorage = () => {
    localStorage.clear();
  };

  return {
    getItem,
    setItem,
    removeItem,
    clearStorage,
  };
};
