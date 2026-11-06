import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./globals.css";
import AdminApp from "./components/AdminApp";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AdminApp />
  </StrictMode>,
);
