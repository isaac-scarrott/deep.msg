import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { router } from "./router";

import "./global.css";
import { ReplicacheProvider } from "./context/replicache";

const rootElement = document.getElementById("root")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <ReplicacheProvider>
        <RouterProvider router={router} />
      </ReplicacheProvider>
    </StrictMode>,
  );
}
