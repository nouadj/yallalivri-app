import AsyncStorage from '@react-native-async-storage/async-storage';

//const API_BASE_URL = "https://yallalivri-back-production.up.railway.app/api/users"; // 🔥 Remplace par ton URL backend
const API_BASE_URL =  "http://192.168.1.32:8080/api/users"
// ✅ Récupération du token JWT pour l'authentification
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    throw new Error("Non Authentifié");
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// ✅ Mise à jour du profil utilisateur
export const updateProfile = async (userId, updatedData) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(updatedData),
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Utilisateur non trouvé.");
      } else {
        throw new Error(`Erreur API : ${response.status}`);
      }
    }

    return await response.json(); // ✅ Retourne les données mises à jour
  } catch (error) {
    throw error;
  }
};

// ✅ Mise à jour du mot de passe
export const updatePassword = async (userId, oldPassword, newPassword) => {
  try {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/${userId}/password`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    // ✅ Vérifie si le backend a retourné une réponse vide
    const text = await response.text();
    if (!text) {
      return { message: "✅ Mot de passe mis à jour avec succès !" }; // Message par défaut
    }

    return JSON.parse(text); // Si réponse JSON valide
  } catch (error) {
    throw error;
  }
};

