import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { tableService } from '../services/tableService'
import { formatMoney } from '../utils/money.utils'
import { colors, spacing, borderRadius, typography } from '../theme'
import type { MainStackParamList } from '../../App'

type NavigationProp = NativeStackNavigationProp<MainStackParamList>
type TableDetailRouteProp = RouteProp<MainStackParamList, 'TableDetail'>

export const TableDetailScreen = () => {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<TableDetailRouteProp>()
  const { tableId } = route.params

  const { data: table, isLoading } = useQuery({
    queryKey: ['table', tableId],
    queryFn: () => tableService.getTableById(tableId),
    staleTime: 1000 * 15,
  })

  if (isLoading || !table) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  const isOccupied = table.status === 'occupied'

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
          <Text style={styles.headerTitle}>Mesa {table.number}</Text>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isOccupied
                  ? colors.tableOccupied
                  : colors.tableFree,
              },
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {isOccupied ? 'Ocupada' : 'Livre'}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.actionButtonPrimary}
            onPress={() =>
              navigation.navigate('NewOrder', {
                tableId: table.id,
                tableNumber: table.number,
              })
            }
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color={colors.white} />
            <Text style={styles.actionButtonPrimaryText}>Novo Pedido</Text>
          </TouchableOpacity>
          {isOccupied && (
            <TouchableOpacity
              style={styles.actionButtonOutline}
              onPress={() =>
                navigation.navigate('TransferTable', {
                  sourceTableId: table.id,
                  sourceTableNumber: table.number,
                })
              }
              activeOpacity={0.8}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={20}
                color={colors.textPrimary}
              />
              <Text style={styles.actionButtonOutlineText}>Transferir Mesa</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Resumo financeiro */}
        {isOccupied && (
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total consumido</Text>
              <Text style={styles.summaryValue}>
                {formatMoney(table.consumption.totalCents)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Total pago</Text>
              <Text style={styles.summaryValueGreen}>
                {formatMoney(table.consumption.paidCents)}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabelBold}>Restante</Text>
              <Text style={styles.summaryValueBold}>
                {formatMoney(table.consumption.remainingCents)}
              </Text>
            </View>
          </View>
        )}

        {/* Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Pedidos ativos</Text>
            <Text style={styles.infoValue}>{table.orders.active}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total de pedidos</Text>
            <Text style={styles.infoValue}>{table.orders.total}</Text>
          </View>
        </View>
      </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  statusBadge: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  statusBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.white,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  summaryLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  summaryLabelBold: {
    ...typography.body,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  summaryValue: {
    ...typography.body,
    color: colors.textPrimary,
  },
  summaryValueGreen: {
    ...typography.body,
    color: colors.success,
  },
  summaryValueBold: {
    ...typography.price,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  infoLabel: {
    ...typography.body,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  actionButtonPrimaryText: {
    ...typography.button,
    color: colors.white,
  },
  actionButtonOutline: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  actionButtonOutlineText: {
    ...typography.button,
    color: colors.textPrimary,
  },
})
