import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ChatProvider } from './src/context/ChatContext';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ChatScreen from './src/screens/ChatScreen';
import HomeScreen from './src/screens/HomeScreen';
import RequestsScreen from './src/screens/RequestsScreen';
import { theme } from './src/theme/theme';

const Stack = createNativeStackNavigator();

function RootNavigator() {
  const { user } = useAuth();

  return (
    <NavigationContainer
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: theme.colors.primary,
          background: theme.colors.background,
          text: theme.colors.text,
          border: theme.colors.border,
          card: theme.colors.background,
        },
      }}
    >
      <Stack.Navigator>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerTitle: 'Sign up' }} />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                headerTitle: 'Home',
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.primary,
              }}
            />
            <Stack.Screen
              name="Requests"
              component={RequestsScreen}
              options={{
                headerTitle: 'Requests',
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.primary,
              }}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{
                headerTitle: 'Chat',
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.primary,
              }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{
                headerTitle: 'Profile',
                headerStyle: { backgroundColor: theme.colors.background },
                headerTintColor: theme.colors.primary,
              }}
            />
            
          </>
        )}
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <RootNavigator />
      </ChatProvider>
    </AuthProvider>
  );
}
