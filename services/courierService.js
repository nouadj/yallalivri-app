import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.32:8080/api/couriers";

// ✅ Fonction pour récupérer les en-têtes d'authentification avec JWT
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) {
    console.error("❌ Aucun token trouvé !");
    throw new Error("Non Authentifié");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// ✅ Fonction pour récupérer les infos d'un livreur via son ID
const getCourierById = async (courierId) => {
  try {
    if (!courierId) throw new Error("❌ Aucun `courierId` fourni !");

    const headers = await getAuthHeaders();
    const response = await fetch(`${API_BASE_URL}/${courierId}`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Erreur API : ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("❌ Erreur récupération livreur :", error);
    return null;
  }
};

export default { getCourierById };
