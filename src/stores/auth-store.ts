import { create } from 'zustand'
import type { ApiUser } from '@/src/lib/api/types'

type AuthState = {
  token: string | null
  user: ApiUser | null
  hydrated: boolean
  setSession: (token: string, user: ApiUser) => void
  setUser: (user: ApiUser | null) => void
  clearSession: () => void
  hydrate: () => void
}

const TOKEN_KEYS = ['imgupscaler-token', 'artguru-token'] as const

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  hydrated: false,
  setSession: (token, user) => {
    if (typeof window !== 'undefined') window.localStorage.setItem(TOKEN_KEYS[0], token)
    set({ token, user, hydrated: true })
  },
  setUser: (user) => set({ user }),
  clearSession: () => {
    if (typeof window !== 'undefined') TOKEN_KEYS.forEach((key) => window.localStorage.removeItem(key))
    set({ token: null, user: null, hydrated: true })
  },
  hydrate: () => {
    if (typeof window === 'undefined') return
    const token = TOKEN_KEYS.map((key) => window.localStorage.getItem(key)).find(Boolean) || null
    set({ token, hydrated: true })
  },
}))
