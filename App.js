import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SplashScreen from 'expo-splash-screen';

import SplashScreenComponent from './screens/SplashScreen';
import LoginScreen from './screens/LoginScreen';
import ReportIssue from './screens/ReportIssue';
import MyReports from './screens/MyReports';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Keep splash visible until manually hidden
SplashScreen.preventAutoHideAsync();

function MainTabs({ onLogout }) {
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: onLogout },
    ]);
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Report Issue') {
            iconName = focused ? 'add-circle' : 'add-circle-outline';
          } else if (route.name === 'My Reports') {
            iconName = focused ? 'list' : 'list-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: 'gray',
        headerStyle: { backgroundColor: '#2196F3' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 15 }}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    >
      <Tab.Screen name="Report Issue" component={ReportIssue} />
      <Tab.Screen name="My Reports" component={MyReports} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Wait for 6 seconds (splash screen duration)
        setTimeout(async () => {
          const token = await AsyncStorage.getItem('user_token');
          setIsLoggedIn(!!token);
          setShowSplash(false);
          await SplashScreen.hideAsync();
        }, 6000); // 6 seconds
      } catch (error) {
        console.log('Error checking auth:', error);
        setShowSplash(false);
        await SplashScreen.hideAsync();
      }
    };

    checkAuthStatus();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user_token');
    await AsyncStorage.removeItem('user_data');
    setIsLoggedIn(false);
  };

  if (showSplash) {
    return <SplashScreenComponent onFinish={() => setShowSplash(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isLoggedIn ? (
          <Stack.Screen name="MainTabs">
            {(props) => <MainTabs {...props} onLogout={handleLogout} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Login">
            {(props) => (
              <LoginScreen {...props} onLoginSuccess={handleLoginSuccess} />
            )}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}