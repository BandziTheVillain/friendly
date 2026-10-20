import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Auth {
    user: User | null;
    isSignedIn: boolean;
    login: (user: User) => void;
    reset: () => void;
    logout: () => void;
}

export const useAuthStore = create<Auth>()(
    persist(
        (set) => ({
            user: null,
            isSignedIn: false,
            login: (user) => set({ user: user, isSignedIn: true }),
            reset: () => set({ user: null, isSignedIn: false }),
            logout: () => set({ user: null, isSignedIn: false }),
        }),
        {
            name: "auth-storage"
        }
    )
);