import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function AddLinkScreen({ navigation }) {
  const { user, updateProfile } = useAuth();
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: 'Add Link',
      headerStyle: { backgroundColor: theme.colors.background },
      headerTintColor: theme.colors.primary,
      headerRight: () => (
        <TouchableOpacity onPress={handleAdd} disabled={!title.trim() || !url.trim()}>
          <Text style={[styles.addButton, (!title.trim() || !url.trim()) && styles.disabledButton]}>
            Add
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, title, url]);

  const handleAdd = () => {
    if (title.trim() && url.trim()) {
      const currentLinks = user?.links || [];
      const updatedLinks = [...currentLinks, { title: title.trim(), url: url.trim() }];
      updateProfile({ links: updatedLinks });
      navigation.goBack();
    } else {
      Alert.alert('Error', 'Please fill in both title and URL');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Instagram, LinkedIn, Website"
          maxLength={30}
          autoFocus
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>URL</Text>
        <TextInput
          style={styles.input}
          value={url}
          onChangeText={setUrl}
          placeholder="https://example.com"
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <Text style={styles.hint}>
        You can add links to your social media profiles, websites, or any other links you want to share with your contacts.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  label: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 8,
    minHeight: 40,
  },
  hint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    padding: 16,
    lineHeight: 20,
  },
  addButton: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
  disabledButton: {
    color: theme.colors.textSecondary,
  },
});