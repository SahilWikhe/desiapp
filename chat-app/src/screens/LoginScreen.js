import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleLogin = async () => {
    setLoading(true);
    const res = await login({ email, password });
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Login failed', res.error || 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor={theme.colors.textMuted}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholderTextColor={theme.colors.textMuted}
      />
      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.replace('Signup')}>
        <Text style={styles.link}>New here? Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(theme) {
  return StyleSheet.create({
    container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: theme.colors.background },
    title: { fontSize: 28, fontWeight: '700', marginBottom: 24, textAlign: 'center', color: theme.colors.primary },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.inputBorder,
      backgroundColor: theme.colors.inputBackground,
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
      color: theme.colors.text,
    },
    button: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: 8, marginTop: 4 },
    buttonText: { color: theme.colors.onPrimary, fontWeight: '700', textAlign: 'center' },
    link: { marginTop: 16, textAlign: 'center', color: theme.colors.primary },
  });
}
