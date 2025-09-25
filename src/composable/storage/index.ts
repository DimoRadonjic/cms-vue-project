export const useStorage = () => {
  const parseItem = <T>(item: string | null, key: string): T | null => {
    if (!item || item === "undefined" || item === "null") {
      return null;
    }

    try {
      return JSON.parse(item) as T;
    } catch (e) {
      console.error(`Failed to parse sessionStorage item for key "${key}":`, e);
      return null;
    }
  };

  const getSessionItem = <T>(key: string): T | null => {
    const item = sessionStorage.getItem(key);

    return parseItem(item, key);
  };

  const getLocalItem = <T>(key: string): T | null => {
    const item = localStorage.getItem(key);

    return parseItem(item, key);
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
