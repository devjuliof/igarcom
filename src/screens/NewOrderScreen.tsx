import React, { useState, useMemo } from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Modal,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { menuService } from '../services/menuService'
import { useAuthStore } from '../stores/authStore'
import { formatMoney } from '../utils/money.utils'
import { colors, spacing, borderRadius, typography } from '../theme'
import type { PublicProduct } from '../types'
import type { MainStackParamList } from '../../App'

type NavigationProp = NativeStackNavigationProp<MainStackParamList>
type NewOrderRouteProp = RouteProp<MainStackParamList, 'NewOrder'>

interface CartItem {
  productId: string
  name: string
  price: number
  quantity: number
}

const NUM_COLUMNS = 2

export const NewOrderScreen = () => {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<NewOrderRouteProp>()
  const { tableId, tableNumber } = route.params
  const { width } = useWindowDimensions()
  const cardWidth = (width - spacing.lg * 3) / NUM_COLUMNS

  const companySlug = useAuthStore((state) => state.user?.companySlug ?? '')

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null,
  )
  const [cart, setCart] = useState<CartItem[]>([])
  const [quantityModal, setQuantityModal] = useState<{
    product: PublicProduct
    quantity: number
  } | null>(null)

  const { data: catalog, isLoading } = useQuery({
    queryKey: ['public-menu', companySlug],
    queryFn: () => menuService.getPublicMenu(companySlug),
    enabled: !!companySlug,
  })

  const categories = catalog?.categories ?? []

  const activeCategoryId = selectedCategoryId ?? categories[0]?.id ?? null

  const products = useMemo(() => {
    const cat = categories.find((c) => c.id === activeCategoryId)
    return cat?.products ?? []
  }, [categories, activeCategoryId])

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  const addToCart = (product: PublicProduct, quantity: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id)
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        },
      ]
    })
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

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
          <Text style={styles.headerTitle}>
            Novo Pedido — Mesa {tableNumber}
          </Text>
        </View>
        <View style={styles.headerRight} />
      </View>

      {/* Category chips */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {categories.map((category) => {
            const isActive = category.id === activeCategoryId
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryChip,
                  isActive && styles.categoryChipActive,
                ]}
                onPress={() => setSelectedCategoryId(category.id)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isActive && styles.categoryChipTextActive,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      {/* Product grid */}
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => setQuantityModal({ product: item, quantity: 1 })}
              activeOpacity={0.95}
            >
              <Text style={styles.productName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.productPrice}>
                {formatMoney(item.price)}
              </Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="fast-food-outline"
              size={64}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>Nenhum produto</Text>
          </View>
        }
      />

      {/* Floating bottom bar */}
      {cartItemCount > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarInfo}>
            <Text style={styles.bottomBarCount}>
              {cartItemCount} {cartItemCount === 1 ? 'item' : 'itens'}
            </Text>
            <Text style={styles.bottomBarTotal}>{formatMoney(cartTotal)}</Text>
          </View>
          <TouchableOpacity
            style={styles.bottomBarButton}
            onPress={() =>
              navigation.navigate('OrderCart', {
                tableId,
                tableNumber,
                items: cart,
              })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.bottomBarButtonText}>Ver Pedido</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Quantity selector modal */}
      {quantityModal && (
        <Modal transparent animationType="fade" visible>
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setQuantityModal(null)}
          >
            <View
              style={styles.modalContent}
              onStartShouldSetResponder={() => true}
            >
              <Text style={styles.modalTitle}>{quantityModal.product.name}</Text>
              <Text style={styles.modalPrice}>
                {formatMoney(quantityModal.product.price)}
              </Text>

              <View style={styles.quantityRow}>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    setQuantityModal((prev) =>
                      prev && prev.quantity > 1
                        ? { ...prev, quantity: prev.quantity - 1 }
                        : prev,
                    )
                  }
                >
                  <Ionicons
                    name="remove"
                    size={24}
                    color={colors.textPrimary}
                  />
                </TouchableOpacity>
                <Text style={styles.quantityText}>
                  {quantityModal.quantity}
                </Text>
                <TouchableOpacity
                  style={styles.quantityButton}
                  onPress={() =>
                    setQuantityModal((prev) =>
                      prev ? { ...prev, quantity: prev.quantity + 1 } : prev,
                    )
                  }
                >
                  <Ionicons name="add" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => {
                  addToCart(quantityModal.product, quantityModal.quantity)
                  setQuantityModal(null)
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.confirmButtonText}>Adicionar</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  categoryContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryScroll: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  categoryChip: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    ...typography.bodySmall,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  listContent: {
    padding: spacing.lg,
  },
  row: {
    gap: spacing.lg,
  },
  productCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  productName: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  productPrice: {
    ...typography.price,
    color: colors.primary,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  bottomBarInfo: {
    flex: 1,
  },
  bottomBarCount: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  bottomBarTotal: {
    ...typography.price,
    color: colors.textPrimary,
  },
  bottomBarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  bottomBarButtonText: {
    ...typography.button,
    color: colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginHorizontal: spacing.lg,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    ...typography.h3,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  modalPrice: {
    ...typography.price,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  quantityButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    ...typography.h2,
    color: colors.textPrimary,
    minWidth: 32,
    textAlign: 'center',
  },
  confirmButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  confirmButtonText: {
    ...typography.button,
    color: colors.white,
  },
})
