import AsyncStorage from "@react-native-async-storage/async-storage";

//const API_BASE_URL = "https://yallalivri-back-production.up.railway.app/api/stores";
const API_BASE_URL =  "http://192.168.1.32:8080/api/users"

// ✅ Fonction pour récupérer les en-têtes d'authentification avec JWT
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) {
    throw new Error("Non Authentifié");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// ✅ Fonction pour récupérer les infos d'un magasin via son ID
const getStoreById = async (storeId) => {
  try {
    if (!storeId) throw new Error("❌ Aucun `storeId` fourni !");

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/${storeId}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Erreur API : ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return null;
  }
};

export default { getStoreById };
