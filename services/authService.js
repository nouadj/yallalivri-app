import AsyncStorage from "@react-native-async-storage/async-storage";
import { registerForPushNotificationsAsync } from "../services/notificationService";

const API_URL = "http://192.168.1.32:8080/auth"; // Remplace avec ton URL backend

export async function login(email, password) {
  try {

    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });


    if (!response.ok) {
      const errorText = await response.text();
      throw new Error("Identifiants invalides");
    }

    const data = await response.json();
    await AsyncStorage.setItem("token", data.token);

    // Récupérer l'utilisateur connecté
    const user = await getCurrentUser();

    // Récupérer et envoyer le token Expo
    const expoPushToken = await registerForPushNotificationsAsync();
    if (expoPushToken && user && user.id) {
      await updateNotificationToken(user.id, expoPushToken);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

async function updateNotificationToken(userId, token) {
  try {
    const authToken = await AsyncStorage.getItem("token");
    if (!authToken) {
      return;
    }

    const response = await fetch(
      `${API_URL}/users/${userId}/notification-token`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationToken: token }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error("Erreur lors de la mise à jour du token de notification");
    }
  } catch (error) {
  }
}

export async function getCurrentUser() {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return null;

    const response = await fetch(`${API_URL}/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) throw new Error("Utilisateur non trouvé");

    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function logout() {
  await AsyncStorage.removeItem("token");
}
