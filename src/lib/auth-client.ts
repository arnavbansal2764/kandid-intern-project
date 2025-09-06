import { createAuthClient } from "better-auth/react";

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL || (typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BETTER_AUTH_URL);

console.log("Auth client baseURL:", baseURL);

export const authClient = createAuthClient({
  baseURL,
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getSession,
} = authClient;
