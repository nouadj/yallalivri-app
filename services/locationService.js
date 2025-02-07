import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.32:8080/api/users"; // 🔥 Remplace par ton URL backend

// ✅ Fonction pour récupérer la position GPS de l'utilisateur
export async function getCurrentLocation() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
    }

    const location = await Location.getCurrentPositionAsync({});
    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    throw error;
  }
}

// ✅ Fonction pour envoyer la position au backend
export async function updateUserLocation(userId) {
  try {
    const authToken = await AsyncStorage.getItem("token");
    if (!authToken) {
      return;
    }

    const location = await getCurrentLocation();
    const response = await fetch(`${API_URL}/${userId}/location`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(location),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Erreur lors de la mise à jour de la position");
    }

  } catch (error) {
  }
}
