import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { theme } from '../theme/theme';

const mockRequests = [
  { id: 'r1', name: 'Aisha Khan' },
  { id: 'r2', name: 'Rohan Patel' },
];

export default function RequestsScreen() {
  return (
    <View style={styles.container}>
      <FlatList
        data={mockRequests}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.itemRow}>
            <View style={styles.avatar} />
            <Text style={styles.name}>{item.name}</Text>
            <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#22c55e' }]}>
                <Text style={styles.actionText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#ef4444' }] }>
                <Text style={styles.actionText}>Decline</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: theme.colors.primaryLight, marginRight: 12, borderWidth: 1, borderColor: theme.colors.inputBorder },
  name: { fontSize: 16, fontWeight: '600' },
  actionBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginLeft: 8 },
  actionText: { color: '#fff', fontWeight: '700' },
  separator: { height: 1, backgroundColor: theme.colors.border },
});
