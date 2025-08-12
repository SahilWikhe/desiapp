import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function ProfileScreen() {
  const { user, logout, setAvatarUri } = useAuth();
  const [phone, setPhone] = useState('');
  const [saving, setSaving] = useState(false);

  const savePhone = async () => {
    // Placeholder: persist locally only in this demo
    Alert.alert('Saved', 'Phone number saved locally');
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Allow photo library access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage}>
        {user?.avatarUri ? (
          <Image source={{ uri: user.avatarUri }} style={styles.avatarImg} />
        ) : (
          <View style={styles.avatar} />
        )}
      </TouchableOpacity>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <TextInput
        style={styles.input}
        placeholder="Phone number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TouchableOpacity style={styles.button} onPress={savePhone} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save Phone'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  avatar: { width: 96, height: 96, borderRadius: 48, backgroundColor: theme.colors.primaryLight, marginBottom: 16, borderWidth: 2, borderColor: theme.colors.primary },
  avatarImg: { width: 96, height: 96, borderRadius: 48, marginBottom: 16, borderWidth: 2, borderColor: theme.colors.primary },
  name: { fontSize: 24, fontWeight: '700' },
  email: { color: theme.colors.textMuted, marginTop: 4 },
  button: { backgroundColor: theme.colors.primary, padding: 12, borderRadius: 8, marginTop: 24, width: '60%' },
  buttonText: { color: 'white', textAlign: 'center', fontWeight: '700' },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
    width: '60%',
  },
});
