import { watch } from "vue";

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

  const watchEffectStorageItem = <T>(key: string, value: T) => {
    watch(
      () => value,
      () => {
        setItem(key, value);
      }
    );
  };

  return {
    getItem,
    setItem,
    removeItem,
    clearStorage,
    watchEffectStorageItem,
  };
};
