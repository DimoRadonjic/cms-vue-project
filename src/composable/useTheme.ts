import { ref } from "vue";
import { useStorage } from "./storage";

const { getSessionItem } = useStorage();

const theme = ref<boolean | null>(getSessionItem("theme"));

export const useTheme = () => {
  const { getSessionItem, setSessionItem } = useStorage();

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
    if (getSessionItem("theme") === null) {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

      theme.value = !prefersDark.matches ? true : false;

      setSessionItem("theme", theme.value);
      change();
    }
    change();
  }

  function switchTheme() {
    theme.value = !theme.value;

    setSessionItem("theme", theme.value);

    setTheme();
  }

  setTheme();

  return { theme, switchTheme };
};
