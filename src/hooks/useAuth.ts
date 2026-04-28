import { useState, useCallback } from 'react'
import { Alert } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuthStore } from '../stores/authStore'
import { authService } from '../services/authService'
import { companyService } from '../services/companyService'
import { pushTokenService } from '../services/pushTokenService'

export const useAuth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { setAuth, clearAuth, user, token } = useAuthStore()

  const login = useCallback(
    async (email: string, password: string) => {
      setIsLoading(true)
      try {
        const response = await authService.login({ email, password })

        await AsyncStorage.setItem('auth-token', response.accessToken)

        // Fetch company info to get slug and name
        let companySlug: string | undefined
        let companyName: string | undefined
        try {
          const company = await companyService.getCompany()
          companySlug = company.slug
          companyName = company.name
        } catch {
          // Continue without company info
        }

        setAuth(response.accessToken, {
          ...response.user,
          companySlug,
          companyName,
        })

        return true
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : 'Email ou senha incorretos'
        Alert.alert('Erro ao entrar', message)
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [setAuth],
  )

  const logout = useCallback(
    async (expoPushToken?: string) => {
      try {
        if (expoPushToken) {
          await pushTokenService
            .deactivate(expoPushToken)
            .catch(() => {})
        }
        await authService.logout().catch(() => {})
      } catch {
        // Ignore logout errors
      } finally {
        await AsyncStorage.removeItem('auth-token')
        clearAuth()
      }
    },
    [clearAuth],
  )

  return { login, logout, isLoading, user, token }
}
