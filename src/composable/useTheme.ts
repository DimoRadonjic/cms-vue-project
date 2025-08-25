import { ref } from "vue";
import { useSessionStorage } from "./sessionStorage/useSessionStorage";

const { getItem } = useSessionStorage();

const theme = ref<boolean | null>(getItem("theme"));

export const useTheme = () => {
  const { getItem, setItem } = useSessionStorage();

  function setTheme() {
    if (getItem("theme") === null) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

      theme.value = prefersDark.matches ? true : false;

      setItem("theme", theme.value);
      return;
    }

    if (theme.value) {
      document.documentElement.classList.remove("my-app-dark");

      document.documentElement.classList.add("my-app-light");
    } else {
      document.documentElement.classList.remove("my-app-light");

      document.documentElement.classList.add("my-app-dark");
    }
  }

  function switchTheme() {
    theme.value = !theme.value;

    setItem("theme", theme.value);

    setTheme();
  }

  setTheme();

  return { theme, switchTheme };
};
