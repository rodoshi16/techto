import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  executeTransfer,
  fetchBriefing,
  fetchHealth,
  fetchSnapshot,
  sendSageChat,
  type ApiSnapshot,
} from "../lib/api";
import { accounts as mockAccounts } from "../data/mockData";
import { buildProactiveBriefing, respondToUser } from "../lib/sageEngine";
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
  apiLive: boolean;
  soraLive: boolean;
  snapshot: ApiSnapshot | null;
  refreshSnapshot: () => Promise<void>;
  transferFunds: (from: string, to: string, amount: number) => Promise<{ ok: boolean; message: string }>;
  loading: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

const defaultMemory: SageMemory = {
  resolvedInsights: [],
  cancelledSubscriptions: [],
};

function sageMessage(content: string): ChatMessage {
  return {
    id: `s-${Date.now()}`,
    role: "sage",
    content,
    timestamp: new Date(),
  };
}

function userMessage(content: string): ChatMessage {
  return {
    id: `u-${Date.now()}`,
    role: "user",
    content,
    timestamp: new Date(),
  };
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [screen, setScreen] = useState<Screen>("home");
  const [sageOpen, setSageOpen] = useState(false);
  const [soraOpen, setSoraOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [memory, setMemory] = useState<SageMemory>(defaultMemory);
  const [sageInitialized, setSageInitialized] = useState(false);
  const [apiLive, setApiLive] = useState(false);
  const [soraLive, setSoraLive] = useState(false);
  const [snapshot, setSnapshot] = useState<ApiSnapshot | null>(null);
  const [loading, setLoading] = useState(false);

  const patchMemory = useCallback((patch: Partial<SageMemory>) => {
    setMemory((m) => ({ ...m, ...patch }));
  }, []);

  const refreshSnapshot = useCallback(async () => {
    try {
      const s = await fetchSnapshot();
      setSnapshot(s);
      if (s.memory) setMemory(s.memory);
    } catch {
      /* API offline */
    }
  }, []);

  useEffect(() => {
    fetchHealth()
      .then((h) => {
        setApiLive(h.sage);
        setSoraLive(h.sora);
        return refreshSnapshot();
      })
      .catch(() => setApiLive(false));

    const interval = setInterval(() => {
      refreshSnapshot();
    }, 45000);
    return () => clearInterval(interval);
  }, [refreshSnapshot]);

  const openSage = useCallback(async () => {
    setSageOpen(true);
    setScreen("sage");

    if (sageInitialized) return;

    setLoading(true);
    try {
      const { reply, snapshot: snap } = await fetchBriefing();
      if (snap) setSnapshot(snap);
      setMessages([sageMessage(reply)]);
      setSageInitialized(true);
    } catch {
      setMessages([buildProactiveBriefing(memory)]);
      setSageInitialized(true);
    } finally {
      setLoading(false);
    }
  }, [sageInitialized, memory]);

  const closeSage = useCallback(() => {
    setSageOpen(false);
    setScreen("home");
    refreshSnapshot();
  }, [refreshSnapshot]);

  const openSora = useCallback(() => {
    setSoraOpen(true);
    setScreen("sora-voice");
  }, []);

  const closeSora = useCallback(() => {
    setSoraOpen(false);
    if (!sageOpen) setScreen("home");
  }, [sageOpen]);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg = userMessage(text);
      setMessages((prev) => [...prev, userMsg]);
      setLoading(true);

      try {
        if (apiLive) {
          const history = [...messages, userMsg]
            .filter((m) => m.role === "user" || m.role === "sage")
            .map((m) => ({
              role: m.role === "user" ? ("user" as const) : ("assistant" as const),
              content: m.content,
            }));
          const { reply, snapshot: snap } = await sendSageChat(text, history);
          if (snap) setSnapshot(snap);
          setMessages((prev) => [...prev, sageMessage(reply)]);
        } else {
          const reply = respondToUser(text, memory, patchMemory);
          setMessages((prev) => [...prev, reply]);
        }
      } catch {
        const reply = respondToUser(text, memory, patchMemory);
        setMessages((prev) => [...prev, reply]);
      } finally {
        setLoading(false);
      }
    },
    [apiLive, messages, memory, patchMemory]
  );

  const handleAction = useCallback(
    (actionId: string) => {
      const labels: Record<string, string> = {
        breakdown: "Yeah, show me the breakdown",
        "rent-only": "Tell me about rent on Friday",
        later: "I'm good for now",
        "set-limit": "Set a $60 weekly dining limit",
        "what-if": "What if I cut DoorDash?",
        "scan-subs": "Scan my subscriptions",
        transfer: "Move $200 from savings to chequing",
      };
      sendMessage(labels[actionId] ?? actionId);
    },
    [sendMessage]
  );

  const transferFunds = useCallback(
    async (from: string, to: string, amount: number) => {
      const result = await executeTransfer(from, to, amount);
      if (result.ok && result.snapshot) {
        setSnapshot(result.snapshot);
        const toAcct = result.snapshot.accounts.find((a) => a.id === to);
        return {
          ok: true,
          message: `Done — $${amount} moved to ${toAcct?.name ?? "your account"}.`,
        };
      }

      const base = snapshot ?? {
        accounts: mockAccounts.map((a) => ({ ...a, type: a.type })),
        transactions: [],
        goals: [],
        alerts: [],
        memory: defaultMemory,
      };
      const fromAcct = base.accounts.find((a) => a.id === from);
      const toAcct = base.accounts.find((a) => a.id === to);
      if (!fromAcct || !toAcct) return { ok: false, message: "Account not found." };
      if (fromAcct.balance < amount) {
        return { ok: false, message: `Not enough in ${fromAcct.name}.` };
      }

      const updated = base.accounts.map((a) => {
        if (a.id === from) return { ...a, balance: a.balance - amount };
        if (a.id === to) return { ...a, balance: a.balance + amount };
        return a;
      });
      setSnapshot({ ...base, accounts: updated });
      return {
        ok: true,
        message: `Done — $${amount} moved to ${toAcct.name}.`,
      };
    },
    [snapshot]
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
      apiLive,
      soraLive,
      snapshot,
      refreshSnapshot,
      transferFunds,
      loading,
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
      apiLive,
      soraLive,
      snapshot,
      refreshSnapshot,
      transferFunds,
      loading,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
