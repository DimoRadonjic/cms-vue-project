import { onMounted, ref } from "vue";

export const useTheme = () => {
  const theme = ref(false);

  onMounted(() => {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

    theme.value = prefersDark.matches ? true : false;

    prefersDark.addEventListener("change", (e) => {
      theme.value = e.matches ? true : false;
    });
  });

  function switchTheme() {
    theme.value = !theme.value;
    if (theme.value) {
      document.documentElement.classList.remove("my-app-dark");

      document.documentElement.classList.add("my-app-light");
    } else {
      document.documentElement.classList.remove("my-app-light");

      document.documentElement.classList.add("my-app-dark");
    }
  }
  switchTheme();
  return { theme, switchTheme };
};
