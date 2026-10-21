import { create } from 'zustand'
import type { FileItem, Route } from '@/src/lib/types'

export type WorkspaceRoute = Exclude<Route, 'pricing'>
type Progress = { completed: number; total: number }
export type WorkspaceSlice = {
  items: FileItem[]
  scale: string
  processing: boolean
  progress: Progress
  prompt: string
  creativity: number
  similarity: number
}

const initialWorkspace = (route: WorkspaceRoute): WorkspaceSlice => ({
  items: [],
  scale: route === 'reimagine' ? '1' : '2',
  processing: false,
  progress: { completed: 0, total: 0 },
  prompt: '',
  creativity: 34,
  similarity: 78,
})

type WorkspaceState = {
  workspaces: Record<WorkspaceRoute, WorkspaceSlice>
  setItems: (route: WorkspaceRoute, items: FileItem[] | ((current: FileItem[]) => FileItem[])) => void
  setScale: (route: WorkspaceRoute, scale: string) => void
  setProcessing: (route: WorkspaceRoute, processing: boolean) => void
  setProgress: (route: WorkspaceRoute, progress: Progress) => void
  setPrompt: (route: WorkspaceRoute, prompt: string) => void
  setCreativity: (route: WorkspaceRoute, creativity: number) => void
  setSimilarity: (route: WorkspaceRoute, similarity: number) => void
}

const routes: WorkspaceRoute[] = ['home', 'enhancer', 'reimagine']
const initialWorkspaces = Object.fromEntries(routes.map((route) => [route, initialWorkspace(route)])) as Record<WorkspaceRoute, WorkspaceSlice>

export const useWorkspaceStore = create<WorkspaceState>((set) => ({
  workspaces: initialWorkspaces,
  setItems: (route, items) => set((state) => ({ workspaces: { ...state.workspaces, [route]: { ...state.workspaces[route], items: typeof items === 'function' ? items(state.workspaces[route].items) : items } } })),
  setScale: (route, scale) => set((state) => ({ workspaces: { ...state.workspaces, [route]: { ...state.workspaces[route], scale } } })),
  setProcessing: (route, processing) => set((state) => ({ workspaces: { ...state.workspaces, [route]: { ...state.workspaces[route], processing } } })),
  setProgress: (route, progress) => set((state) => ({ workspaces: { ...state.workspaces, [route]: { ...state.workspaces[route], progress } } })),
  setPrompt: (route, prompt) => set((state) => ({ workspaces: { ...state.workspaces, [route]: { ...state.workspaces[route], prompt } } })),
  setCreativity: (route, creativity) => set((state) => ({ workspaces: { ...state.workspaces, [route]: { ...state.workspaces[route], creativity } } })),
  setSimilarity: (route, similarity) => set((state) => ({ workspaces: { ...state.workspaces, [route]: { ...state.workspaces[route], similarity } } })),
}))
