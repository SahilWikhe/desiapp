import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <View style={styles.avatar} />
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: theme.colors.primaryLight, marginBottom: 16, borderWidth: 2, borderColor: theme.colors.primary },
  name: { fontSize: 24, fontWeight: '700' },
  email: { color: theme.colors.textMuted, marginTop: 4 },
  button: { backgroundColor: theme.colors.primary, padding: 12, borderRadius: 8, marginTop: 24, width: '60%' },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '700' },
});
