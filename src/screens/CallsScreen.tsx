import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { waiterCallService } from '../services/waiterCallService'
import { formatTime, getRelativeTime } from '../utils/date.utils'
import { colors, spacing, borderRadius, typography } from '../theme'
import type { WaiterCall } from '../types'

const CallCard = ({
  call,
  onAcknowledge,
  onComplete,
}: {
  call: WaiterCall
  onAcknowledge: () => void
  onComplete: () => void
}) => {
  const isPending = call.status === 'pending'
  const isAcknowledged = call.status === 'acknowledged'
  const isBill = call.type === 'bill'

  return (
    <View
      style={[styles.card, isAcknowledged && styles.cardAcknowledged]}
    >
      <View style={styles.cardLeft}>
        <View style={styles.cardHeader}>
          <Ionicons
            name="restaurant"
            size={24}
            color={isPending ? colors.primary : colors.textMuted}
          />
          <Text
            style={[
              styles.tableText,
              !isPending && styles.textMuted,
            ]}
          >
            Mesa {call.tableNumber}
          </Text>
          <View
            style={[
              styles.typeBadge,
              { backgroundColor: isBill ? colors.warning : colors.primary },
            ]}
          >
            <Text style={styles.typeBadgeText}>
              {isBill ? 'Conta' : 'Chamado'}
            </Text>
          </View>
        </View>

        <Text style={styles.timeText}>
          {formatTime(call.createdAt)} - {getRelativeTime(call.createdAt)}
        </Text>
      </View>

      <View style={styles.cardActions}>
        {isPending && (
          <TouchableOpacity
            style={styles.acknowledgeButton}
            onPress={onAcknowledge}
            activeOpacity={0.8}
          >
            <Text style={styles.acknowledgeButtonText}>Atender</Text>
          </TouchableOpacity>
        )}

        {isAcknowledged && (
          <TouchableOpacity
            style={styles.completeButton}
            onPress={onComplete}
            activeOpacity={0.8}
          >
            <Ionicons
              name="checkmark-done"
              size={20}
              color={colors.textMuted}
            />
            <Text style={styles.completeButtonText}>Concluir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
}

export const CallsScreen = () => {
  const queryClient = useQueryClient()

  const {
    data: calls,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['waiter-calls'],
    queryFn: () => waiterCallService.getCalls(),
    staleTime: 1000 * 10,
    refetchInterval: 1000 * 30,
  })

  const acknowledgeMutation = useMutation({
    mutationFn: waiterCallService.acknowledgeCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter-calls'] })
    },
    onError: () => {
      Alert.alert('Erro', 'Nao foi possivel atender o chamado')
    },
  })

  const completeMutation = useMutation({
    mutationFn: waiterCallService.completeCall,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['waiter-calls'] })
    },
    onError: () => {
      Alert.alert('Erro', 'Nao foi possivel concluir o chamado')
    },
  })

  const pendingCalls = (calls ?? []).filter((c) => c.status === 'pending')
  const acknowledgedCalls = (calls ?? []).filter(
    (c) => c.status === 'acknowledged',
  )
  const sortedCalls = [...pendingCalls, ...acknowledgedCalls]

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
        <Text style={styles.headerTitle}>Chamados</Text>
        <Text style={styles.headerSubtitle}>
          {pendingCalls.length} pendente
          {pendingCalls.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <FlatList
        data={sortedCalls}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            colors={[colors.primary]}
          />
        }
        renderItem={({ item }) => (
          <CallCard
            call={item}
            onAcknowledge={() => acknowledgeMutation.mutate(item.id)}
            onComplete={() => completeMutation.mutate(item.id)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={64}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>Nenhum chamado</Text>
            <Text style={styles.emptySubtitle}>
              Chamados aparecerao aqui quando clientes chamarem
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
  card: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardAcknowledged: {
    backgroundColor: '#FAFAFA',
  },
  cardLeft: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  tableText: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  textMuted: {
    color: colors.textMuted,
  },
  typeBadge: {
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  typeBadgeText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.white,
  },
  timeText: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  cardActions: {
    marginLeft: spacing.md,
  },
  acknowledgeButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  acknowledgeButtonText: {
    ...typography.button,
    color: colors.white,
  },
  completeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  completeButtonText: {
    ...typography.bodySmall,
    color: colors.textMuted,
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
    textAlign: 'center',
  },
})
