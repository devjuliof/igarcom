import { useState, useEffect, useRef, useCallback } from 'react'
import { Platform } from 'react-native'
import * as Notifications from 'expo-notifications'
import * as Device from 'expo-device'
import Constants from 'expo-constants'
import type { EventSubscription } from 'expo-modules-core'
import { pushTokenService } from '../services/pushTokenService'
import { useAuthStore } from '../stores/authStore'

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
})

export const usePushNotifications = () => {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null)
  const notificationListener = useRef<EventSubscription>(undefined)
  const responseListener = useRef<EventSubscription>(undefined)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const registerForPushNotifications = useCallback(async () => {
    if (!Device.isDevice) {
      console.log('[Push] Must use physical device for push notifications')
      return null
    }

    // Setup Android channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('waiter-calls', {
        name: 'Chamados de Garcom',
        importance: Notifications.AndroidImportance.MAX,
        sound: 'default',
        vibrationPattern: [0, 250, 250, 250],
      })
    }

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync()
    let finalStatus = existingStatus

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync()
      finalStatus = status
    }

    if (finalStatus !== 'granted') {
      console.log('[Push] Permission not granted')
      return null
    }

    const projectId = Constants.expoConfig?.extra?.eas?.projectId
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    })

    return tokenData.data
  }, [])

  useEffect(() => {
    if (!isAuthenticated) return

    let mounted = true

    const setup = async () => {
      const token = await registerForPushNotifications()
      if (!mounted || !token) return

      setExpoPushToken(token)

      try {
        await pushTokenService.register({
          expoPushToken: token,
          deviceName: Device.deviceName ?? undefined,
          platform: Platform.OS as 'ios' | 'android',
        })
      } catch (error) {
        console.error('[Push] Failed to register token:', error)
      }
    }

    void setup()

    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        if (__DEV__) {
          console.log('[Push] Received:', notification)
        }
      })

    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        if (__DEV__) {
          console.log('[Push] Tapped:', response)
        }
      })

    return () => {
      mounted = false
      notificationListener.current?.remove()
      responseListener.current?.remove()
    }
  }, [isAuthenticated, registerForPushNotifications])

  return { expoPushToken }
}
