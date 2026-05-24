import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { buildProactiveBriefing, respondToAction, respondToUser } from "../lib/sageEngine";
import type { ChatMessage, SageMemory, Screen } from "../types";

interface AppContextValue {
  screen: Screen;
  setScreen: (s: Screen) => void;
  sageOpen: boolean;
  openSage: () => void;
  closeSage: () => void;
  soraOpen: boolean;
  openSora: () => void;
  closeSora: () => void;
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  handleAction: (actionId: string) => void;
  memory: SageMemory;
  sageInitialized: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const defaultMemory: SageMemory = {
  resolvedInsights: [],
  cancelledSubscriptions: [],
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("home");
  const [sageOpen, setSageOpen] = useState(false);
  const [soraOpen, setSoraOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memory, setMemory] = useState<SageMemory>(defaultMemory);
  const [sageInitialized, setSageInitialized] = useState(false);

  const patchMemory = useCallback((patch: Partial<SageMemory>) => {
    setMemory((m) => ({ ...m, ...patch }));
  }, []);

  const openSage = useCallback(() => {
    setSageOpen(true);
    setScreen("sage");
    if (!sageInitialized) {
      setMessages([buildProactiveBriefing(defaultMemory)]);
      setSageInitialized(true);
    }
  }, [sageInitialized]);

  const closeSage = useCallback(() => {
    setSageOpen(false);
    setScreen("home");
  }, []);

  const openSora = useCallback(() => {
    setSoraOpen(true);
    setScreen("sora-voice");
  }, []);

  const closeSora = useCallback(() => {
    setSoraOpen(false);
    if (!sageOpen) setScreen("home");
  }, [sageOpen]);

  const sendMessage = useCallback(
    (text: string) => {
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: text,
        timestamp: new Date(),
      };
      const reply = respondToUser(text, memory, patchMemory);
      setMessages((prev) => [...prev, userMsg, reply]);
    },
    [memory, patchMemory]
  );

  const handleAction = useCallback(
    (actionId: string) => {
      const reply = respondToAction(actionId, memory, patchMemory);
      const labels: Record<string, string> = {
        breakdown: "Yeah, show me",
        "rent-only": "Just the rent warning",
        later: "I'm good for now",
        "set-limit": "Set $60/week limit",
        "what-if": "What if I cut DoorDash?",
        "scan-subs": "Scan my subscriptions",
        "no-thanks": "Nope, all good",
        transfer: "Move $200 from savings",
        remind: "Remind me Thursday",
        "flag-disney": "Flag Disney+ to cancel",
        keep: "Keep everything",
        thanks: "Thanks, Sage",
        subs: "My subscriptions",
      };
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        content: labels[actionId] ?? actionId,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMsg, reply]);
    },
    [memory, patchMemory]
  );

  const value = useMemo(
    () => ({
      screen,
      setScreen,
      sageOpen,
      openSage,
      closeSage,
      soraOpen,
      openSora,
      closeSora,
      messages,
      sendMessage,
      handleAction,
      memory,
      sageInitialized,
    }),
    [
      screen,
      sageOpen,
      openSage,
      closeSage,
      soraOpen,
      openSora,
      closeSora,
      messages,
      sendMessage,
      handleAction,
      memory,
      sageInitialized,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
