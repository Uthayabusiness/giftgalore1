import { createRoot } from "react-dom/client";
import { Router } from "wouter";
import App from "./App";
import "./index.css";

// Declare Cashfree global object for TypeScript
declare global {
  interface Window {
    Cashfree: any;
  }
}

createRoot(document.getElementById("root")!).render(
  <Router>
    <App />
  </Router>
);
