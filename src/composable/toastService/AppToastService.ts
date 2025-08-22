import { useToast } from "primevue";

export const useToastService = () => {
  const toast = useToast();

  const showSuccess = (
    message: string = "Success",
    time: number = 3000,
    detail?: string
  ) => {
    toast.add({
      severity: "success",
      summary: message,
      detail: detail,
      life: time,
    });
  };

  const showError = (
    message: string = "Error",
    detail: any = new Error("An error occurred"),
    time: number = 3000
  ) => {
    toast.add({
      severity: "error",
      summary: message,
      detail:
        detail instanceof Error
          ? detail.message
          : new Error("An error occurred"),
      life: time,
    });
  };

  const showWarning = (
    message: string = "Warning",
    detail: Error,
    time: number = 3000
  ) => {
    toast.add({
      severity: "warning",
      summary: message,
      detail: detail.message,

      life: time,
    });
  };

  return {
    showSuccess,
    showError,
    showWarning,
  };
};
