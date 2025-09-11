import { faCheck, faInfo, faSpinner, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Toaster as SonnerToaster } from "sonner";

import { useTheme } from "@/lib/theme";

const Toaster = () => {
  const { theme } = useTheme();

  return (
    <SonnerToaster
      theme={theme}
      icons={{
        error: <FontAwesomeIcon icon={faTriangleExclamation} className="text-destructive" />,
        success: <FontAwesomeIcon icon={faCheck} className="text-success" />,
        warning: <FontAwesomeIcon icon={faTriangleExclamation} className="text-warning" />,
        loading: <FontAwesomeIcon icon={faSpinner} className="text-loading" />,
        info: <FontAwesomeIcon icon={faInfo} className="text-info" />,
      }}
      toastOptions={{
        actionButtonStyle: {
          backgroundColor: "var(--color-primary)",
          color: "var(--color-primary-foreground)",
        },
      }}
      closeButton
      richColors
      position="bottom-center"
    />
  );
};

export { Toaster };
