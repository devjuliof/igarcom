import { create } from 'zustand'

interface NotificationState {
  pendingCallsCount: number
  setPendingCallsCount: (count: number) => void
  incrementPendingCalls: () => void
  decrementPendingCalls: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  pendingCallsCount: 0,
  setPendingCallsCount: (count) => set({ pendingCallsCount: count }),
  incrementPendingCalls: () =>
    set((state) => ({ pendingCallsCount: state.pendingCallsCount + 1 })),
  decrementPendingCalls: () =>
    set((state) => ({
      pendingCallsCount: Math.max(0, state.pendingCallsCount - 1),
    })),
}))
