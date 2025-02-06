import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getCurrentUser, logout } from '../services/authService';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.replace('Login');
  };

  if (!user) return <Text>Chargement...</Text>;

  return (
    <View style={styles.container}>
      {/* En-tête Profil */}
      <View style={styles.header}>
        <Text style={styles.title}>👤 Profil</Text>
      </View>

      {/* Informations Utilisateur */}
      <View style={styles.profileBox}>
        <Text style={styles.info}>📛 Nom: <Text style={styles.bold}>{user.name}</Text></Text>
        <Text style={styles.info}>📧 Email: <Text style={styles.bold}>{user.email}</Text></Text>
        <Text style={styles.info}>🎭 Rôle: <Text style={styles.bold}>{user.role}</Text> {user.role === "STORE" ? "🏪" : "🛵"}</Text>
        <Text style={styles.info}>📞 Téléphone: <Text style={styles.bold}>{user.phone}</Text></Text>
      </View>

      {/* Bouton Déconnexion en bas */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 Se déconnecter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5', justifyContent: 'space-between' },
  header: { alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#333' },
  profileBox: { backgroundColor: 'white', padding: 20, borderRadius: 10, width: '100%', elevation: 3 },
  info: { fontSize: 18, marginBottom: 10, color: '#555' },
  bold: { fontWeight: 'bold', color: '#222' },
  
  logoutContainer: { alignItems: 'center', marginBottom: 30 },
  logoutButton: { backgroundColor: '#E74C3C', padding: 15, borderRadius: 10, width: '90%', alignItems: 'center' },
  logoutButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});
