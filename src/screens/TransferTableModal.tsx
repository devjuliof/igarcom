import React from 'react'
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { RouteProp } from '@react-navigation/native'
import { tableService } from '../services/tableService'
import { colors, spacing, borderRadius, typography } from '../theme'
import type { Table } from '../types'
import type { MainStackParamList } from '../../App'

type NavigationProp = NativeStackNavigationProp<MainStackParamList>
type TransferTableRouteProp = RouteProp<MainStackParamList, 'TransferTable'>

const NUM_COLUMNS = 2

export const TransferTableModal = () => {
  const navigation = useNavigation<NavigationProp>()
  const route = useRoute<TransferTableRouteProp>()
  const { sourceTableId, sourceTableNumber } = route.params
  const { width } = useWindowDimensions()
  const cardWidth = (width - spacing.lg * 3) / NUM_COLUMNS

  const {
    data: tables,
    isLoading,
  } = useQuery({
    queryKey: ['tables', 'free'],
    queryFn: () => tableService.getTables('free'),
  })

  const transferMutation = useMutation({
    mutationFn: (destTableId: string) =>
      tableService.transferTable(sourceTableId, destTableId),
    onSuccess: () => {
      Alert.alert('Transferido', 'A mesa foi transferida com sucesso', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ])
    },
    onError: () => {
      Alert.alert('Erro', 'Nao foi possivel transferir a mesa')
    },
  })

  const handleSelectTable = (destTable: Table) => {
    Alert.alert(
      'Confirmar transferencia',
      `Transferir pedidos da Mesa ${sourceTableNumber} para Mesa ${destTable.number}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Transferir',
          onPress: () => transferMutation.mutate(destTable.id),
        },
      ],
    )
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
        <View style={styles.headerLeft} />
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Transferir Mesa {sourceTableNumber}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.closeButton}
        >
          <Ionicons name="close" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitle}>
        Selecione a mesa de destino
      </Text>

      <FlatList
        data={tables}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.row}
        renderItem={({ item }) => (
          <View style={{ width: cardWidth }}>
            <TouchableOpacity
              style={styles.tableCard}
              onPress={() => handleSelectTable(item)}
              activeOpacity={0.95}
              disabled={transferMutation.isPending}
            >
              <Ionicons
                name="restaurant-outline"
                size={24}
                color={colors.tableFree}
              />
              <Text style={styles.tableNumber}>{item.number}</Text>
              {item.name && (
                <Text style={styles.tableName}>{item.name}</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="swap-horizontal-outline"
              size={64}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>Nenhuma mesa livre</Text>
            <Text style={styles.emptySubtitle}>
              Nao ha mesas disponiveis para transferencia
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  listContent: {
    padding: spacing.lg,
  },
  row: {
    gap: spacing.lg,
  },
  tableCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    padding: spacing.lg,
    marginBottom: spacing.lg,
    alignItems: 'center',
  },
  tableNumber: {
    ...typography.h2,
    color: colors.textPrimary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  tableName: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
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
