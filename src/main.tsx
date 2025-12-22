import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";
import "./i18n/config";

try {
  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element not found");
  }

  createRoot(rootElement).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
} catch (error) {
  console.error("Failed to render app:", error);
  document.body.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Application Error</h1>
      <p>${error instanceof Error ? error.message : String(error)}</p>
      <p>Check the browser console for more details.</p>
    </div>
  `;
}
