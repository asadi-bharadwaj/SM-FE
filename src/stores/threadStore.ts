import { create } from "zustand";
import { sendChatMessage } from "../api/chatApi";
import { getCurrentUserId } from "../lib/currentUser";

type State = {
  version: number;
  send: (threadId: string, body: string) => Promise<void>;
  bump: () => void;
};

export const useThreadStore = create<State>((set) => ({
  version: 0,
  bump: () => set((s) => ({ version: s.version + 1 })),
  send: async (threadId, body) => {
    const uid = getCurrentUserId();
    if (!uid) throw new Error("Not signed in");
    await sendChatMessage(threadId, uid, body);
    set((s) => ({ version: s.version + 1 }));
  },
}));

export function useThreadVersion() {
  return useThreadStore((s) => s.version);
}
