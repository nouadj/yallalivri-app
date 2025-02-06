import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { login, getCurrentUser } from '../services/authService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      console.log("Envoi de la requête...");
      const response = await login(email, password);
      console.log("Réponse API:", response);

      await AsyncStorage.setItem('token', response.token);
      const user = await getCurrentUser();
      console.log("Utilisateur mis à jour :", user);

      navigation.replace('HomeTabs', { user });
    } catch (error) {
      console.error("Erreur de connexion:", error);
      Alert.alert('Erreur', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Text style={styles.title}>Bienvenue sur Yalla Livri !</Text>

      <View style={styles.inputBox}>
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Mot de passe" value={password} onChangeText={setPassword} secureTextEntry />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>🚀 Se connecter</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f7f7f7' },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#333', marginBottom: 20 },
  inputBox: { width: '100%', marginBottom: 20 },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 10, marginBottom: 15, paddingHorizontal: 15, backgroundColor: 'white' },
  button: { backgroundColor: '#3498DB', padding: 15, borderRadius: 10, width: '100%', alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
