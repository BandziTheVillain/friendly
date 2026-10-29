import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth";

/** Clears the auth cookies server-side, then drops local state with a full reload so no cached data survives. */
export async function signOut() {
  try {
    await api.post("/auth/logout/");
  } catch {
    // already signed out on the server; still clear things locally
  }
  useAuthStore.getState().logout();
  window.location.href = "/auth/sign-in";
}
