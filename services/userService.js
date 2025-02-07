import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = "http://192.168.1.32:8080/api/users"; // 🔥 Remplace par ton URL backend

// ✅ Récupération du token JWT pour l'authentification
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) {
    console.error("❌ Aucun token trouvé !");
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
    console.error("❌ Erreur mise à jour profil :", error);
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

    return await response.json();
  } catch (error) {
    console.error("❌ Erreur mise à jour du mot de passe :", error);
    throw error;
  }
};
