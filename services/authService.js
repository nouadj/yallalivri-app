import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.1.32:8080/auth';  // Remplace avec ton URL backend

export async function login(email, password) {
    try {
      console.log("Tentative de connexion...");
  
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json', // Ajout pour s'assurer du bon format
        },
        body: JSON.stringify({ email, password }),
      });
  
      console.log("Réponse reçue:", response.status);
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Erreur serveur:", errorText);
        throw new Error('Identifiants invalides');
      }
  
      const data = await response.json();
      await AsyncStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      console.error("Erreur lors de la connexion:", error);
      throw error;
    }
  }
  

export async function getCurrentUser() {
  try {
    const token = await AsyncStorage.getItem('token');
    if (!token) return null;

    const response = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error('Utilisateur non trouvé');

    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function logout() {
  await AsyncStorage.removeItem('token');
}
