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
    if (isSignedIn) {
      convex.setAuth(async () =>
        getToken({ template: "convex", skipCache: true })
      );
    } else {
      convex.clearAuth();
    }
  }, [getToken, isSignedIn]);
  return null;
}

ReactDOM.render(
  <StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ConvexProvider client={convex}>
        <ClerkConvexAdapter />
        <App />
      </ConvexProvider>
    </ClerkProvider>
  </StrictMode>,
  document.getElementById("root")
);
