import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { login } from '../services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      console.log("Envoi de la requête...");
      const response = await login(email, password); // <-- Ton API
      console.log("Réponse API:", response);

      // ✅ Stocke le token
      await AsyncStorage.setItem('token', response.token);

      // ✅ On navigue vers HomeTabs
      navigation.replace('HomeTabs');
    } catch (error) {
      console.error("Erreur de connexion:", error);
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button title="Se connecter" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  title: {
    fontSize: 24, marginBottom: 20,
  },
  input: {
    width: '100%', height: 40, borderWidth: 1, borderColor: '#ccc',
    marginBottom: 10, paddingHorizontal: 10,
  },
});
