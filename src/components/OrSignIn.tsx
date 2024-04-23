import React from "react";
import { SignedIn, SignedOut, useClerk, useAuth } from "@clerk/clerk-react";

export function OrSignIn({ children }: { children: React.ReactNode }) {
  const { isLoaded } = useAuth();
  const clerk = useClerk();

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <button
          onClick={(e) => {
            e.preventDefault();
            clerk.openSignIn();
          }}
          disabled={!isLoaded}
        >
          Sign In First
        </button>
      </SignedOut>
    </>
  );
}
