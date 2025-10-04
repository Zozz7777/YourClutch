import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, description?: string) => {
    sonnerToast.success(message, {
      description,
      duration: 4000,
    });
  },
  
  error: (message: string, description?: string) => {
    sonnerToast.error(message, {
      description,
      duration: 6000,
    });
  },
  
  warning: (message: string, description?: string) => {
    sonnerToast.warning(message, {
      description,
      duration: 5000,
    });
  },
  
  info: (message: string, description?: string) => {
    sonnerToast.info(message, {
      description,
      duration: 4000,
    });
  },
  
  loading: (message: string) => {
    return sonnerToast.loading(message);
  },
  
  dismiss: (toastId?: string | number) => {
    sonnerToast.dismiss(toastId);
  },
  
  promise: <T>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
  ) => {
    return sonnerToast.promise(promise, {
      loading,
      success,
      error,
    });
  }
};
