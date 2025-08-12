import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function SignupScreen({ navigation }) {
  const { signup } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);
    const res = await signup({ name, email, password });
    setLoading(false);
    if (!res.ok) {
      Alert.alert('Signup failed', res.error || 'Please try again');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create account</Text>
      <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Sign up'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.replace('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 24, textAlign: 'center', color: theme.colors.primary },
  input: {
    borderWidth: 1, borderColor: theme.colors.inputBorder, backgroundColor: theme.colors.primaryLight, borderRadius: 8, padding: 12, marginBottom: 12,
  },
  button: { backgroundColor: theme.colors.primary, padding: 14, borderRadius: 8, marginTop: 4 },
  buttonText: { color: 'white', fontWeight: '700', textAlign: 'center' },
  link: { marginTop: 16, textAlign: 'center', color: theme.colors.primary },
});
