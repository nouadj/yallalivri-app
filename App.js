import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    // Vérifier et enregistrer le token
    const checkTokenAndRegisterNotifications = async () => {
      const token = await AsyncStorage.getItem('token');
      setInitialRoute(token ? 'HomeTabs' : 'Login');

      if (token) {
        await registerForPushNotifications();
      }
    };
    
    checkTokenAndRegisterNotifications();
  }, []);

  // 🔥 Fonction pour récupérer et envoyer le token de notification
  async function registerForPushNotifications() {
    if (!Device.isDevice) {
      return;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return;
    }

    const expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;

    const userId = await getUserId(); // 🔥 On récupère l'ID utilisateur
    if (userId) {
      await sendNotificationTokenToBackend(userId, expoPushToken);
    }
  }

  // 🔥 Fonction pour récupérer l'ID utilisateur depuis AsyncStorage
  async function getUserId() {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        const user = JSON.parse(userJson);
        return user.id;
      }
    } catch (error) {
    }
    return null;
  }

  // 🔥 Fonction pour envoyer le token au backend
  async function sendNotificationTokenToBackend(userId, token) {
    const authToken = await AsyncStorage.getItem('token');
    try {
      const response = await fetch(`http://192.168.1.32:8080/auth/${userId}/notification-token`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (!response.ok) throw new Error("❌ Erreur lors de l'envoi du token de notification");
    } catch (error) {
    }
  }

  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return <AppNavigator initialRoute={initialRoute} />;
}
