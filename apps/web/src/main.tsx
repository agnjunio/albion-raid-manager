import React from "react";
import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { BrowserRouter } from "react-router-dom";
import App from "./app";
import "./index.css";
import { AuthProvider } from "./lib/auth";
import { ThemeProvider } from "./lib/theme";
function GlobalError({ error }: { error: Error }) {
  return <p>Something went wrong: {error.message}</p>;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary fallbackRender={GlobalError}>
      <BrowserRouter>
        <ThemeProvider defaultTheme="system" storageKey="theme">
          <AuthProvider>
            <App />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
