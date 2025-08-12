import React from 'react';
import { Text } from 'react-native';

export default function TabIcon({ label, focused }) {
  return (
    <Text style={{ fontWeight: focused ? '700' : '400', color: focused ? '#1e90ff' : '#888' }}>
      {label}
    </Text>
  );
}
