import { create } from 'zustand'
import type { FileItem, Route } from '@/src/lib/types'

type WorkspaceState = {
  items: FileItem[]
  scale: string
  processing: boolean
  progress: { completed: number; total: number }
  prompt: string
  creativity: number
  similarity: number
  setItems: (items: FileItem[] | ((current: FileItem[]) => FileItem[])) => void
  setScale: (scale: string) => void
  setProcessing: (processing: boolean) => void
  setProgress: (progress: { completed: number; total: number }) => void
  setPrompt: (prompt: string) => void
  setCreativity: (creativity: number) => void
  setSimilarity: (similarity: number) => void
  resetForRoute: (route: Route) => void
}

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  items: [],
  scale: '2',
  processing: false,
  progress: { completed: 0, total: 0 },
  prompt: '高清、更多细节、4K',
  creativity: 34,
  similarity: 78,
  setItems: (items) => set((state) => ({ items: typeof items === 'function' ? items(state.items) : items })),
  setScale: (scale) => set({ scale }),
  setProcessing: (processing) => set({ processing }),
  setProgress: (progress) => set({ progress }),
  setPrompt: (prompt) => set({ prompt }),
  setCreativity: (creativity) => set({ creativity }),
  setSimilarity: (similarity) => set({ similarity }),
  // Route changes only change the default model preset. Files stay in the workspace so
  // a user can inspect the same batch while moving between tools.
  resetForRoute: (route) => set({ scale: route === 'reimagine' ? '1' : '2' }),
}))
