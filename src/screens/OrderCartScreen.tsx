import React, { useState } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useMutation } from '@tanstack/react-query'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { orderService } from '../services/orderService'
import { useAuthStore } from '../stores/authStore'
import { formatMoney } from '../utils/money.utils'
import { colors, spacing, borderRadius, typography } from '../theme'
import type { MainStackParamList } from '../../App'

type NavigationProp = NativeStackNavigationProp<MainStackParamList>
type OrderCartRouteProp = RouteProp<MainStackParamList, 'OrderCart'>

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

export const OrderCartScreen = () => {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<OrderCartRouteProp>()
  const { tableId, tableNumber, items: initialItems } = route.params

  const companySlug = useAuthStore((state) => state.user?.companySlug ?? '')

  const [items, setItems] = useState<CartItem[]>(initialItems)

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  const updateQuantity = (productId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    )
  }

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId))
  }

  const createOrderMutation = useMutation({
    mutationFn: () =>
      orderService.createOrder(companySlug, {
        source: 'waiter',
        deliveryType: 'dine_in',
        tableId,
        tableNumber,
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
        paymentMethod: 'cash',
      }),
    onSuccess: () => {
      Alert.alert('Pedido enviado', 'O pedido foi enviado para a cozinha', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('TableDetail', { tableId }),
        },
      ])
    },
    onError: () => {
      Alert.alert('Erro', 'Nao foi possivel enviar o pedido')
    },
  })

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Pedido — Mesa {tableNumber}</Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.productId}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>
                {formatMoney(item.price)} x {item.quantity}
              </Text>
            </View>
            <View style={styles.itemActions}>
              <Text style={styles.itemSubtotal}>
                {formatMoney(item.price * item.quantity)}
              </Text>
              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.productId, -1)}
                >
                  <Ionicons
                    name="remove"
                    size={18}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() => updateQuantity(item.productId, 1)}
                >
                  <Ionicons name="add" size={18} color={colors.textPrimary} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeItem(item.productId)}
                >
                  <Ionicons name="close" size={18} color={colors.error} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="cart-outline"
              size={64}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>Carrinho vazio</Text>
          </View>
        }
      />

      {/* Bottom total + send */}
      <View style={styles.bottomBar}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatMoney(total)}</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.sendButton,
            (items.length === 0 || createOrderMutation.isPending) &&
              styles.sendButtonDisabled,
          ]}
          onPress={() => createOrderMutation.mutate()}
          disabled={items.length === 0 || createOrderMutation.isPending}
          activeOpacity={0.8}
        >
          {createOrderMutation.isPending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Text style={styles.sendButtonText}>Enviar Pedido</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  headerRight: {
    width: 40,
  },
  listContent: {
    padding: spacing.lg,
  },
  itemCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  itemInfo: {
    marginBottom: spacing.sm,
  },
  itemName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemPrice: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  itemSubtotal: {
    ...typography.price,
    color: colors.textPrimary,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
  },
  emptyTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  bottomBar: {
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  totalLabel: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonText: {
    ...typography.button,
    color: colors.white,
  },
})
