import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#0d0f12",
              color: "#fff",
              borderRadius: "10px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#0ea47a", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);