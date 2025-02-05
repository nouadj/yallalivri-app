import React from 'react';
import { View, Text, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const handleLogout = async () => {
    // Supprimer le token (déconnexion)
    await AsyncStorage.removeItem('token');
    // Revenir sur Login
    navigation.replace('Login');
  };

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Bienvenue sur la Home !</Text>
      <Button title="Se déconnecter" onPress={handleLogout} />
    </View>
  );
}
