import React, { useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function EditProfileScreen({ navigation, route }) {
  const { field, title, currentValue } = route.params;
  const { updateProfile } = useAuth();
  const [value, setValue] = useState(currentValue);

  const maxLength = field === 'name' ? 25 : field === 'about' ? 139 : 20;

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: title,
      headerStyle: { backgroundColor: theme.colors.background },
      headerTintColor: theme.colors.primary,
      headerRight: () => (
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.saveButton}>Save</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, value]);

  const handleSave = () => {
    if (value.trim()) {
      updateProfile({ [field]: value.trim() });
      navigation.goBack();
    } else {
      Alert.alert('Error', `Please enter a valid ${title.toLowerCase()}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, field === 'about' && styles.multilineInput]}
          value={value}
          onChangeText={setValue}
          placeholder={`Enter your ${title.toLowerCase()}`}
          multiline={field === 'about'}
          maxLength={maxLength}
          autoFocus
          keyboardType={field === 'phone' ? 'phone-pad' : 'default'}
        />
        <View style={styles.footer}>
          <Text style={styles.characterCount}>
            {value.length}/{maxLength}
          </Text>
        </View>
      </View>

      {field === 'name' && (
        <Text style={styles.hint}>
          This is not your username or pin. This name will be visible to your contacts.
        </Text>
      )}

      {field === 'about' && (
        <Text style={styles.hint}>
          You can add a few lines about yourself. Anyone who views your profile will see this text.
        </Text>
      )}

      {field === 'phone' && (
        <Text style={styles.hint}>
          This phone number will be visible to your contacts.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  inputContainer: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  input: {
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: 8,
    minHeight: 40,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  hint: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    padding: 16,
    lineHeight: 20,
  },
  saveButton: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 16,
  },
});