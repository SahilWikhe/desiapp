import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { searchProfilesByName, sendContactRequest } from '../lib/requests';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SearchScreen() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const onSearch = async () => {
    setLoading(true);
    const data = await searchProfilesByName(query);
    setResults((data || []).filter(r => r.id !== user?.id));
    setLoading(false);
  };

  const onRequest = async (targetId) => {
    const res = await sendContactRequest(targetId);
    if (!res.ok) Alert.alert('Error', res.error || 'Failed to send request');
    else Alert.alert('Sent', 'Request sent');
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Search by name"
          value={query}
          onChangeText={setQuery}
          placeholderTextColor={theme.colors.textMuted}
        />
        <TouchableOpacity style={styles.button} onPress={onSearch} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Searching...' : 'Search'}</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <View style={styles.avatar} />
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.name || 'Unnamed'}</Text>
            </View>
            <TouchableOpacity style={styles.requestBtn} onPress={() => onRequest(item.id)}>
              <Text style={styles.requestBtnText}>Request</Text>
            </TouchableOpacity>
          </View>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={{ paddingTop: 16 }}
      />
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
    row: { flexDirection: 'row' },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      borderRadius: 8,
      padding: 12,
      backgroundColor: theme.colors.inputBackground,
      marginRight: 8,
      color: theme.colors.text,
    },
    button: { backgroundColor: theme.colors.primary, paddingHorizontal: 16, borderRadius: 8, justifyContent: 'center' },
    buttonText: { color: theme.colors.onPrimary, fontWeight: '700' },
    item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.colors.surfaceMuted,
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      marginRight: 12,
    },
    name: { fontWeight: '700', color: theme.colors.text },
    requestBtn: { backgroundColor: theme.colors.primary, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
    requestBtnText: { color: theme.colors.onPrimary, fontWeight: '700' },
    separator: { height: 1, backgroundColor: theme.colors.border },
  });
}

