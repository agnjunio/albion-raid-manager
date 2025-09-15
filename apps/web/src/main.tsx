import React from "react";

import ReactDOM from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { Provider as ReduxProvider } from "react-redux";
import { BrowserRouter } from "react-router-dom";

import App from "./app";
import "./index.css";
import "./lib/i18n";
import { Theme, ThemeProvider } from "./lib/theme";
import { store } from "./store";

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

function GlobalError({ error }: { error: Error }) {
  return <p>Something went wrong: {error.message}</p>;
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary fallbackRender={GlobalError}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ThemeProvider defaultTheme={Theme.SYSTEM} storageKey="theme">
          <ReduxProvider store={store}>
            <App />
          </ReduxProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>,
);
