import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function ProfileScreen() {
  const { user, logout, setAvatarUri, updatePhone, updateProfileDetails } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [interestsText, setInterestsText] = useState((user?.interests || []).join(', '));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setPhone(user?.phone || '');
    setBio(user?.bio || '');
    setInterestsText((user?.interests || []).join(', '));
  }, [user?.bio, user?.interests, user?.name, user?.phone]);

  const saveProfile = async () => {
    setSaving(true);
    const interestList = interestsText
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);

    const [phoneRes, profileRes] = await Promise.all([
      updatePhone(phone),
      updateProfileDetails({ bio, interests: interestList, name: name.trim() || 'User' }),
    ]);
    setSaving(false);

    if (!phoneRes.ok || !profileRes.ok) {
      const error = phoneRes.error || profileRes.error || 'Unable to save profile right now';
      Alert.alert('Error', error);
    } else {
      Alert.alert('Saved', 'Your profile is up to date.');
    }
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
      await setAvatarUri(uri);
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
        placeholder="Display name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone number"
        keyboardType="phone-pad"
        value={phone}
        onChangeText={setPhone}
      />
      <TextInput
        style={[styles.input, { height: 100 }]}
        placeholder="Bio"
        value={bio}
        onChangeText={setBio}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Interests (comma separated)"
        value={interestsText}
        onChangeText={setInterestsText}
      />
      <TouchableOpacity style={styles.button} onPress={saveProfile} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save profile'}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center' },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.primaryLight,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
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
