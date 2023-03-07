import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { useEffect, StrictMode } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

function ClerkConvexAdapter() {
  const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    convex.setAuth(async () =>
      isSignedIn
        ? await getToken({ template: "convex", skipCache: true })
        : null
    );
  }, [convex, getToken, isSignedIn]);
  return <></>;
}

ReactDOM.render(
  <StrictMode>
    <ConvexProvider client={convex}>
      <App />
    </ConvexProvider>
  </StrictMode>,
  document.getElementById("root")
);
