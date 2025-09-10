export const createLink = (file: File) => {
  return URL.createObjectURL(file);
};

export function debounce<F extends (...args: any[]) => any>(
  func: F,
  delay = 300
) {
  let timer: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>): void => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}
