import { ref } from "vue";
import { useSessionStorage } from "./sessionStorage/useSessionStorage";

const { getItem } = useSessionStorage();

const theme = ref<boolean | null>(getItem("theme"));

export const useTheme = () => {
  const { getItem, setItem } = useSessionStorage();

  function setLigtTheme() {
    document.documentElement.classList.remove("my-app-dark");
    document.documentElement.classList.add("my-app-light");
  }

  function setDarkTheme() {
    document.documentElement.classList.remove("my-app-light");
    document.documentElement.classList.add("my-app-dark");
  }

  function change() {
    if (theme.value) {
      setLigtTheme();
    } else {
      setDarkTheme();
    }
  }

  function setTheme() {
    if (getItem("theme") === null) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

      theme.value = !prefersDark.matches ? true : false;

      setItem("theme", theme.value);
      change();
    }
    change();
  }

  function switchTheme() {
    theme.value = !theme.value;

    setItem("theme", theme.value);

    setTheme();
  }

  setTheme();

  return { theme, switchTheme };
};
