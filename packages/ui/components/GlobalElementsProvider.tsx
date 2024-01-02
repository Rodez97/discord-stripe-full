import React, { createContext, useState } from "react";
import dynamic from "next/dynamic";

const LoadingBackdrop = dynamic(() => import("./LoadingBackdrop"), {
  ssr: false,
});
const Snackbar = dynamic(() => import("@mui/material/Snackbar"), {
  ssr: false,
});

type GlobalElementsContextType = {
  openLoadingBackdrop: () => void;
  closeLoadingBackdrop: () => void;
  openSnackbar: (options: SnackbarOptions) => void;
  closeSnackbar: () => void;
};

type SnackbarOptions = {
  message: string;
  severity: "success" | "info" | "warning" | "error";
};

export const GlobalElementsContext = createContext(
  {} as GlobalElementsContextType
);

function GlobalElementsProvider({ children }: { children: React.ReactNode }) {
  const [loadingBackdropOpen, setLoadingBackdropOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState<
    SnackbarOptions | undefined
  >();

  const openLoadingBackdrop = () => {
    setLoadingBackdropOpen(true);
  };

  const closeLoadingBackdrop = () => {
    setLoadingBackdropOpen(false);
  };

  const openSnackbar = (options: SnackbarOptions) => {
    setSnackbarOpen(options);
  };

  const closeSnackbar = () => {
    setSnackbarOpen(undefined);
  };

  return (
    <GlobalElementsContext.Provider
      value={{
        openLoadingBackdrop,
        closeLoadingBackdrop,
        openSnackbar,
        closeSnackbar,
      }}
    >
      {children}
      <LoadingBackdrop open={loadingBackdropOpen} />
      <Snackbar
        open={Boolean(snackbarOpen)}
        autoHideDuration={5000}
        onClose={closeSnackbar}
        message={snackbarOpen?.message}
      />
    </GlobalElementsContext.Provider>
  );
}

export default GlobalElementsProvider;
