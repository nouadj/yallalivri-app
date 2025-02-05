import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './navigation/AppNavigator';

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    // On vérifie s'il y a déjà un token
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
      // Si on a un token, on démarre directement sur HomeTabs, sinon Login
      setInitialRoute(token ? 'HomeTabs' : 'Login');
    };
    checkToken();
  }, []);

  // Tant qu'on n'a pas déterminé la route initiale, on affiche un "loading"
  if (initialRoute === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // On passe la route initiale en prop à AppNavigator
  return <AppNavigator initialRoute={initialRoute} />;
}
