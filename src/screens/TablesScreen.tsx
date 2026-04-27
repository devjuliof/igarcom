import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery } from '@tanstack/react-query'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { tableService } from '../services/tableService'
import { formatMoney } from '../utils/money.utils'
import { colors, spacing, borderRadius, typography } from '../theme'
import type { Table } from '../types'
import type { MainStackParamList } from '../../App'

type NavigationProp = NativeStackNavigationProp<MainStackParamList>

const NUM_COLUMNS = 2

const TableCard = ({
  table,
  onPress,
}: {
  table: Table
  onPress: () => void
}) => {
  const isFree = table.status === 'free'

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.95}
    >
      <View style={styles.cardHeader}>
        <Ionicons
          name="restaurant-outline"
          size={24}
          color={isFree ? colors.tableFree : colors.tableOccupied}
        />
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: isFree ? colors.tableFree : colors.tableOccupied },
          ]}
        >
          <Text style={styles.statusBadgeText}>
            {isFree ? 'Livre' : 'Ocupada'}
          </Text>
        </View>
      </View>

      <Text style={styles.tableNumber}>{table.number}</Text>
      {table.name && <Text style={styles.tableName}>{table.name}</Text>}

      {!isFree && (
        <View style={styles.cardFooter}>
          <Text style={styles.footerText}>
            {table.orders.active} pedido{table.orders.active !== 1 ? 's' : ''}
          </Text>
          <Text style={styles.footerTotal}>
            {formatMoney(table.consumption.totalCents)}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

export const TablesScreen = () => {
  const navigation = useNavigation<NavigationProp>()
  const { width } = useWindowDimensions()
  const cardWidth = (width - spacing.lg * 3) / NUM_COLUMNS

  const {
    data: tables,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['tables'],
    queryFn: () => tableService.getTables(),
    staleTime: 1000 * 30,
  })

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
        <Text style={styles.headerTitle}>Mesas</Text>
        <Text style={styles.headerSubtitle}>
          {tables?.length ?? 0} mesa{(tables?.length ?? 0) !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={tables}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <TableCard
              table={item}
              onPress={() =>
                navigation.navigate('TableDetail', { tableId: item.id })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="restaurant-outline"
              size={64}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>Nenhuma mesa</Text>
            <Text style={styles.emptySubtitle}>
              Cadastre mesas no painel admin
            </Text>
          </View>
        }
      />
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.h2,
    color: colors.textPrimary,
  },
  headerSubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  listContent: {
    padding: spacing.lg,
  },
  row: {
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
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
  tableNumber: {
    ...typography.h2,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tableName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  footerTotal: {
    ...typography.price,
    color: colors.textPrimary,
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
  emptySubtitle: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
})
