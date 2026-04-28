import React from 'react'
import {
  View,
  Text,
  ScrollView,
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
import { colors } from '../theme'
import type { WaiterCall } from '../types'

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
    refetchInterval: 1000 * 15,
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

  const allCalls = calls ?? []
  const pendingCalls = allCalls.filter((c: WaiterCall) => c.status === 'pending')
  const acknowledgedCalls = allCalls.filter((c: WaiterCall) => c.status === 'acknowledged')
  const sortedCalls = [...pendingCalls, ...acknowledgedCalls]

  if (__DEV__) console.log(`[CallsScreen] total=${allCalls.length} pending=${pendingCalls.length} ack=${acknowledgedCalls.length} sorted=${sortedCalls.length}`)

  if (isLoading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={s.header}>
        <Text style={s.headerTitle}>Chamados</Text>
        <Text style={s.headerSub}>
          {pendingCalls.length} pendente{pendingCalls.length !== 1 ? 's' : ''}
        </Text>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={s.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} colors={[colors.primary]} />
        }
      >
        {sortedCalls.length === 0 && (
          <View style={s.empty}>
            <Ionicons name="notifications-off-outline" size={64} color="#999" />
            <Text style={s.emptyTitle}>Nenhum chamado</Text>
            <Text style={s.emptySub}>Chamados aparecerao aqui quando clientes chamarem</Text>
          </View>
        )}

        {sortedCalls.map((item: WaiterCall) => (
          <CallCard
            key={item.id}
            item={item}
            onAcknowledge={() => acknowledgeMutation.mutate(item.id)}
            onComplete={() => completeMutation.mutate(item.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  )
}

const CallCard = ({
  item,
  onAcknowledge,
  onComplete,
}: {
  item: WaiterCall
  onAcknowledge: () => void
  onComplete: () => void
}) => {
  const isPending = item.status === 'pending'
  const isBill = item.type === 'bill'

  return (
    <View style={[s.card, !isPending && s.cardMuted]}>
      <View style={s.cardRow}>
        <Ionicons name="restaurant" size={22} color={isPending ? colors.primary : '#999'} />
        <Text style={[s.cardTable, !isPending && { color: '#999' }]}>Mesa {item.tableNumber}</Text>
        <View style={[s.badge, { backgroundColor: isBill ? '#F59E0B' : colors.primary }]}>
          <Text style={s.badgeText}>{isBill ? 'Conta' : 'Chamado'}</Text>
        </View>
      </View>

      <Text style={s.cardTime}>
        {formatTime(item.createdAt)} - {getRelativeTime(item.createdAt)}
      </Text>

      {isPending ? (
        <TouchableOpacity style={s.btnPrimary} onPress={onAcknowledge} activeOpacity={0.8}>
          <Text style={s.btnPrimaryText}>Atender</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={s.btnGhost} onPress={onComplete} activeOpacity={0.8}>
          <Ionicons name="checkmark-done" size={18} color="#999" />
          <Text style={s.btnGhostText}>Concluir</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F5F5' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' },
  header: { backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E0E0E0', paddingHorizontal: 24, paddingVertical: 16 },
  headerTitle: { fontSize: 24, fontWeight: '700', color: '#1A1A1A' },
  headerSub: { fontSize: 14, color: '#666', marginTop: 4 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  empty: { alignItems: 'center', paddingTop: 100 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#1A1A1A', marginTop: 24 },
  emptySub: { fontSize: 14, color: '#666', marginTop: 8, textAlign: 'center' },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', padding: 16, marginBottom: 12 },
  cardMuted: { backgroundColor: '#FAFAFA' },
  cardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cardTable: { fontSize: 18, fontWeight: '700', color: '#1A1A1A', marginLeft: 8, marginRight: 8 },
  badge: { borderRadius: 100, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { fontSize: 12, fontWeight: '600', color: '#FFFFFF' },
  cardTime: { fontSize: 14, color: '#666', marginBottom: 10 },
  btnPrimary: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, alignSelf: 'flex-start' },
  btnPrimaryText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  btnGhost: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', paddingVertical: 4 },
  btnGhostText: { fontSize: 14, color: '#999', marginLeft: 4 },
})
