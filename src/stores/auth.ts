import { create } from 'zustand';
import { getSession, setSession, clearSession, getPublisherByUserId } from '../lib/storage';
import type { Session, PublisherProfile } from '../lib/types';

interface AuthState {
  session: Session | null;
  publisher: PublisherProfile | null;
  init: () => void;
  login: (session: Session) => void;
  logout: () => void;
  refreshPublisher: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  publisher: null,
  init: () => {
    const s = getSession();
    if (s) {
      const pub = getPublisherByUserId(s.userId);
      set({ session: s, publisher: pub });
    } else {
      set({ session: null, publisher: null });
    }
  },
  login: (s) => {
    setSession(s);
    const pub = getPublisherByUserId(s.userId);
    set({ session: s, publisher: pub });
  },
  logout: () => {
    clearSession();
    set({ session: null, publisher: null });
  },
  refreshPublisher: () => {
    const s = getSession();
    if (s) {
      const pub = getPublisherByUserId(s.userId);
      set({ publisher: pub });
    }
  },
}));
