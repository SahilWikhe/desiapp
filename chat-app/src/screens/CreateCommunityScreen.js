import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useCommunity } from '../context/CommunityContext';
import { theme } from '../theme/theme';

export default function CreateCommunityScreen() {
  const navigation = useNavigation();
  const { handleCreateCommunity } = useCommunity();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Name required', 'Please give your community a name.');
      return;
    }
    setSaving(true);
    const res = await handleCreateCommunity({ name, description, isPrivate });
    setSaving(false);
    if (!res.ok) {
      Alert.alert('Unable to create', res.error || 'Please try again');
    } else {
      Alert.alert('Created', 'Your new community is ready!', [
        {
          text: 'View community',
          onPress: () => navigation.replace('CommunityDetail', { communityId: res.community.id }),
        },
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Start a new community</Text>
      <TextInput
        style={styles.input}
        placeholder="Community name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, { height: 120 }]}
        placeholder="What is this community about?"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TouchableOpacity style={styles.toggleRow} onPress={() => setIsPrivate((prev) => !prev)}>
        <View style={[styles.checkbox, isPrivate && styles.checkboxChecked]} />
        <Text style={styles.toggleText}>Private community (requires approval to join)</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.submitBtn, saving && { opacity: 0.7 }]} onPress={handleSubmit} disabled={saving}>
        <Text style={styles.submitText}>{saving ? 'Creating...' : 'Create community'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: 16 },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    backgroundColor: 'white',
  },
  toggleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1,
    borderColor: theme.colors.inputBorder,
    borderRadius: 6,
    marginRight: 12,
  },
  checkboxChecked: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
  toggleText: { color: theme.colors.text },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitText: { color: 'white', fontWeight: '700' },
});

