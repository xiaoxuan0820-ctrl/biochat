import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AppState {
  // Theme
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Model
  model: string;
  setModel: (model: string) => void;

  // API Keys
  apiKeys: Record<string, string>;
  setApiKey: (provider: string, key: string) => void;
  deleteApiKey: (provider: string) => void;

  // Service Status
  dockerStatus: boolean;
  deerflowStatus: boolean;
  setDockerStatus: (status: boolean) => void;
  setDeerflowStatus: (status: boolean) => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Recent conversations
  recentConversations: Array<{
    id: string;
    title: string;
    timestamp: number;
  }>;
  addConversation: (title: string) => void;
  deleteConversation: (id: string) => void;
  clearConversations: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.classList.toggle('dark', theme === 'dark');
        document.documentElement.classList.toggle('light', theme === 'light');
      },
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark';
        get().setTheme(newTheme);
      },

      // Model
      model: 'deepseek',
      setModel: (model) => set({ model }),

      // API Keys
      apiKeys: {},
      setApiKey: (provider, key) =>
        set((state) => ({
          apiKeys: { ...state.apiKeys, [provider]: key },
        })),
      deleteApiKey: (provider) =>
        set((state) => {
          const { [provider]: _, ...rest } = state.apiKeys;
          return { apiKeys: rest };
        }),

      // Service Status
      dockerStatus: false,
      deerflowStatus: false,
      setDockerStatus: (status) => set({ dockerStatus: status }),
      setDeerflowStatus: (status) => set({ deerflowStatus: status }),

      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Recent conversations
      recentConversations: [],
      addConversation: (title) =>
        set((state) => ({
          recentConversations: [
            { id: Date.now().toString(), title, timestamp: Date.now() },
            ...state.recentConversations.slice(0, 9),
          ],
        })),
      deleteConversation: (id) =>
        set((state) => ({
          recentConversations: state.recentConversations.filter((c) => c.id !== id),
        })),
      clearConversations: () => set({ recentConversations: [] }),
    }),
    {
      name: 'biochat-storage',
      partialize: (state) => ({
        theme: state.theme,
        model: state.model,
        apiKeys: state.apiKeys,
        recentConversations: state.recentConversations,
      }),
    }
  )
);

// Initialize theme on load
if (typeof window !== 'undefined') {
  const theme = localStorage.getItem('biochat-storage');
  if (theme) {
    try {
      const parsed = JSON.parse(theme);
      if (parsed.state?.theme === 'dark' || parsed.state?.theme === 'light') {
        document.documentElement.classList.toggle('dark', parsed.state.theme === 'dark');
        document.documentElement.classList.toggle('light', parsed.state.theme === 'light');
      }
    } catch {
      document.documentElement.classList.add('dark');
    }
  } else {
    document.documentElement.classList.add('dark');
  }
}
