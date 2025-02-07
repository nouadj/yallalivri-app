import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
  I18nManager,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import "../locales/i18n"; // ⚠️ Charger la configuration des langues
import { changeLanguage } from "../locales/i18n"; // ✅ Importer la fonction pour changer de langue
import { login, getCurrentUser } from "../services/authService";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();
  const { t } = useTranslation(); // ✅ Hook de traduction

  const handleLogin = async () => {
    try {
      console.log("Envoi de la requête...");
      const response = await login(email, password);
      console.log("Réponse API:", response);

      await AsyncStorage.setItem("token", response.token);
      const user = await getCurrentUser();
      console.log("Utilisateur mis à jour :", user);

      navigation.replace("HomeTabs", { user });
    } catch (error) {
      console.error("Erreur de connexion:", error);
      Alert.alert(t("login.error"), t("login.error_message")); // ✅ Message d'erreur traduit
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../assets/logo.png")} style={styles.logo} />
      <Text style={styles.title}>{t("login.welcome")}</Text>

      <View style={styles.inputBox}>
        <TextInput
          style={[styles.input, I18nManager.isRTL && styles.inputRTL]}
          placeholder={t("login.email")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={[styles.input, I18nManager.isRTL && styles.inputRTL]}
          placeholder={t("login.password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>{t("login.button")}</Text>
      </TouchableOpacity>

      {/* ✅ Boutons de sélection de la langue */}
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
          <Text style={styles.languageText}>🇩🇿 العربية</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  logo: { width: 120, height: 120, marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "bold", color: "#333", marginBottom: 20 },
  inputBox: { width: "100%", marginBottom: 20 },
  input: {
    width: "100%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: "white",
  },
  inputRTL: { textAlign: "right" }, // ✅ Alignement RTL pour l'arabe
  button: {
    backgroundColor: "#3498DB",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    alignItems: "center",
  },
  buttonText: { color: "white", fontSize: 18, fontWeight: "bold" },

  // ✅ Styles pour la sélection de la langue
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
