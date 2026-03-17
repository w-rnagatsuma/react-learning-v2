import React from "react";
import ReactDOM from "react-dom/client";
import App from "@/App";
import { AppQueryProvider } from "@/api/trpc/provider";
import { SessionProvider } from "@/api/session/SessionProvider";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppQueryProvider>
      <SessionProvider>
        <App />
      </SessionProvider>
    </AppQueryProvider>
  </React.StrictMode>,
);