import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { theme } from '../theme/theme';

export default function SettingsScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [showProfileModal, setShowProfileModal] = useState(false);

  const navigateToEdit = (field, title) => {
    console.log('navigateToEdit called with:', field, title);
    console.log('navigation object:', navigation);
    try {
      // Get the parent navigator (stack navigator) to navigate to EditProfile
      const parentNavigation = navigation.getParent();
      if (parentNavigation) {
        parentNavigation.navigate('EditProfile', { 
          field, 
          title, 
          currentValue: user?.[field] || '' 
        });
      } else {
        console.error('Parent navigation not found');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const navigateToAddLink = () => {
    console.log('navigateToAddLink called');
    console.log('navigation object:', navigation);
    try {
      // Get the parent navigator (stack navigator) to navigate to AddLink
      const parentNavigation = navigation.getParent();
      if (parentNavigation) {
        parentNavigation.navigate('AddLink');
      } else {
        console.error('Parent navigation not found');
      }
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const ProfileModal = () => (
    <Modal
      visible={showProfileModal}
      animationType="slide"
      onRequestClose={() => setShowProfileModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowProfileModal(false)}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.profileImageSection}>
            <View style={styles.profileImageContainer}>
              <Image
                source={{
                  uri: user?.profilePicture || 'https://via.placeholder.com/150/cccccc/ffffff?text=User'
                }}
                style={styles.profileImage}
              />
            </View>
            <TouchableOpacity style={styles.editImageButton}>
              <Text style={styles.editImageText}>CHANGE PROFILE PHOTO</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.profileField}>
            <Text style={styles.fieldLabel}>Name</Text>
            <TouchableOpacity 
              style={styles.fieldRow}
              activeOpacity={0.7}
              onPress={() => {
                console.log('Name field pressed!');
                navigateToEdit('name', 'Name');
              }}
            >
              <Text style={styles.fieldValue}>{user?.name || 'Your Name'}</Text>
              <Ionicons name="pencil" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            <Text style={styles.fieldHint}>This is not your username or pin. This name will be visible to your contacts.</Text>
          </View>

          <View style={styles.profileField}>
            <Text style={styles.fieldLabel}>About</Text>
            <TouchableOpacity 
              style={styles.fieldRow}
              activeOpacity={0.7}
              onPress={() => navigateToEdit('about', 'About')}
            >
              <Text style={styles.fieldValue}>{user?.about || 'Hey there! I am using DesiApp.'}</Text>
              <Ionicons name="pencil" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileField}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <TouchableOpacity 
              style={styles.fieldRow}
              activeOpacity={0.7}
              onPress={() => navigateToEdit('phone', 'Phone')}
            >
              <Text style={styles.fieldValue}>{user?.phone || '+1 (555) 123-4567'}</Text>
              <Ionicons name="pencil" size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={styles.profileField}>
            <Text style={styles.fieldLabel}>Links</Text>
            {user?.links && user.links.length > 0 ? (
              user.links.map((link, index) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.linkItem}
                  onLongPress={() => {
                    Alert.alert(
                      'Remove Link',
                      `Remove "${link.title}"?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        { text: 'Remove', style: 'destructive', onPress: () => removeLink(index) }
                      ]
                    );
                  }}
                >
                  <View style={styles.linkContent}>
                    <Text style={styles.linkTitle}>{link.title}</Text>
                    <Text style={styles.linkUrl}>{link.url}</Text>
                  </View>
                  <Ionicons name="open-outline" size={16} color={theme.colors.primary} />
                </TouchableOpacity>
              ))
            ) : null}
            <TouchableOpacity 
              style={styles.fieldRow}
              activeOpacity={0.7}
              onPress={navigateToAddLink}
            >
              <Text style={[styles.fieldValue, { color: theme.colors.primary }]}>Add a link</Text>
              <Ionicons name="add" size={20} color={theme.colors.primary} />
            </TouchableOpacity>
            <Text style={styles.fieldHint}>You can add links to your social media profiles, websites, or any other links you want to share.</Text>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollContainer}>
        <TouchableOpacity 
          style={styles.profileSection}
          onPress={() => setShowProfileModal(true)}
        >
          <Image
            source={{
              uri: user?.profilePicture || 'https://via.placeholder.com/60/cccccc/ffffff?text=U'
            }}
            style={styles.profileAvatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name || 'Your Name'}</Text>
            <Text style={styles.profileStatus}>{user?.about || 'Hey there! I am using DesiApp.'}</Text>
          </View>
          <Ionicons name="qr-code-outline" size={24} color={theme.colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.separator} />

        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.settingsItem}>
            <Ionicons name="key-outline" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.settingsText}>Account</Text>
            <Text style={styles.settingsSubtext}>Security notifications, change number</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <Ionicons name="lock-closed-outline" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.settingsText}>Privacy</Text>
            <Text style={styles.settingsSubtext}>Block contacts, disappearing messages</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <Ionicons name="chatbubble-outline" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.settingsText}>Chats</Text>
            <Text style={styles.settingsSubtext}>Theme, wallpapers, chat history</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.settingsText}>Notifications</Text>
            <Text style={styles.settingsSubtext}>Message, group & call tones</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <Ionicons name="cellular-outline" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.settingsText}>Storage and data</Text>
            <Text style={styles.settingsSubtext}>Network usage, auto-download</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.settingsItem}>
            <Ionicons name="help-circle-outline" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.settingsText}>Help</Text>
            <Text style={styles.settingsSubtext}>Help center, contact us, privacy policy</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.settingsItem}>
            <Ionicons name="people-outline" size={24} color={theme.colors.textSecondary} />
            <Text style={styles.settingsText}>Invite a friend</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.separator} />

        <TouchableOpacity style={styles.logoutButton} onPress={logout}>
          <Ionicons name="log-out-outline" size={24} color="#ff4444" />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </ScrollView>

      <ProfileModal />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  profileStatus: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  separator: {
    height: 8,
    backgroundColor: '#f0f0f0',
  },
  settingsSection: {
    backgroundColor: theme.colors.background,
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingsText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: 16,
    flex: 1,
  },
  settingsSubtext: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    marginLeft: 16,
    flex: 1,
    marginTop: 2,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  logoutText: {
    fontSize: 16,
    color: '#ff4444',
    marginLeft: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
  },
  modalContent: {
    flex: 1,
  },
  profileImageSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: theme.colors.background,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editImageButton: {
    paddingVertical: 8,
  },
  editImageText: {
    color: theme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  profileField: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  fieldLabel: {
    fontSize: 14,
    color: theme.colors.primary,
    marginBottom: 8,
  },
  fieldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  fieldValue: {
    fontSize: 16,
    color: theme.colors.text,
    flex: 1,
  },
  fieldHint: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 8,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
  linkUrl: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
});