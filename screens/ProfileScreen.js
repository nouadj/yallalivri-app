import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { getCurrentUser, logout } from "../services/authService";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../locales/i18n";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const { t } = useTranslation();
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.replace("Login");
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
        <Text style={styles.info}>
          📛 {t("profile.name")}: <Text style={styles.bold}>{user.name}</Text>
        </Text>
        <Text style={styles.info}>
          📧 {t("profile.email")}: <Text style={styles.bold}>{user.email}</Text>
        </Text>
        <Text style={styles.info}>
          🎭 {t("profile.role")}:{" "}
          <Text style={styles.bold}>
            {t(`roles.${user.role.toLowerCase()}`)}
          </Text>{" "}
          {user.role === "STORE" ? "🏪" : "🛵"}
        </Text>
        <Text style={styles.info}>
          📞 {t("profile.phone")}: <Text style={styles.bold}>{user.phone}</Text>
        </Text>
      </View>

      {/* Sélection de la langue */}
      <View style={styles.languageContainer}>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => changeLanguage("en")}
        >
          <Text style={styles.languageText}>🇬🇧 English</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => changeLanguage("fr")}
        >
          <Text style={styles.languageText}>🇫🇷 Français</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => changeLanguage("ar")}
        >
          <Text style={styles.languageText}>🇸🇦 العربية</Text>
        </TouchableOpacity>
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
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
    justifyContent: "space-between",
  },
  header: { alignItems: "center", marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", color: "#333" },
  profileBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    elevation: 3,
  },
  info: { fontSize: 18, marginBottom: 10, color: "#555" },
  bold: { fontWeight: "bold", color: "#222" },

  logoutContainer: { alignItems: "center", marginBottom: 30 },
  logoutButton: {
    backgroundColor: "#E74C3C",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  logoutButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  languageContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  languageButton: {
    backgroundColor: "#3498DB",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  languageText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
