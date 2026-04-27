import { useEffect, useRef } from 'react'
import { io, Socket } from 'socket.io-client'
import { useAuthStore } from '../stores/authStore'
import { useNotificationStore } from '../stores/notificationStore'
import type { WaiterCall } from '../types'

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null)
  const token = useAuthStore((state) => state.token)
  const user = useAuthStore((state) => state.user)
  const incrementPendingCalls = useNotificationStore(
    (state) => state.incrementPendingCalls,
  )
  const decrementPendingCalls = useNotificationStore(
    (state) => state.decrementPendingCalls,
  )

  useEffect(() => {
    if (!token || !user) return

    const socket = io(`${API_URL}/tables`, {
      transports: ['websocket', 'polling'],
      auth: { token },
    })

    socketRef.current = socket

    socket.on('connect', () => {
      if (__DEV__) console.log('[WS] Connected')
      socket.emit('subscribe', { companyId: user.companyId })
    })

    socket.on('authenticated', () => {
      if (__DEV__) console.log('[WS] Authenticated')
    })

    socket.on('waiter:call:new', (_call: WaiterCall) => {
      incrementPendingCalls()
    })

    socket.on('waiter:call:acknowledged', (_call: WaiterCall) => {
      decrementPendingCalls()
    })

    socket.on('disconnect', () => {
      if (__DEV__) console.log('[WS] Disconnected')
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [token, user, incrementPendingCalls, decrementPendingCalls])

  return { socket: socketRef.current }
}
