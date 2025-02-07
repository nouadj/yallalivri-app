import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from "react-native";
import { getCurrentUser, logout } from "../services/authService";
import { updateProfile, updatePassword } from "../services/userService";
import { useTranslation } from "react-i18next";
import { changeLanguage } from "../locales/i18n";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({ email: "", phone: "" });
  const { t } = useTranslation();
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      // Pré-remplir les champs d'édition
      if (userData) {
        setEditData({ email: userData.email, phone: userData.phone });
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.replace("Login");
  };

  const handleSaveProfile = async () => {
    if (!editData.email || !editData.phone) {
      Alert.alert(
        t("alerts.error_profile_update"),
        t("alerts.fill_all_fields")
      );
      return;
    }

    try {
      const updatedUser = await updateProfile(user.id, {
        email: editData.email,
        phone: editData.phone,
      });

      setUser(updatedUser);
      Alert.alert(t("alerts.success_profile_updated"));
      setEditModalVisible(false);
    } catch (error) {
      Alert.alert(t("alerts.error_profile_update"));
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      Alert.alert(t("alerts.error_fill_fields"));
      return;
    }

    try {
      await updatePassword(user.id, oldPassword, newPassword);
      Alert.alert(t("alerts.success_password_updated"));
      setPasswordModalVisible(false);
    } catch (error) {
      Alert.alert(t("alerts.error_password_update"));
    }
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
          {t("profile.role")}:{" "}
          <Text style={styles.bold}>
            {t(`roles.${user.role.toLowerCase()}`)}
          </Text>{" "}
          {user.role === "STORE" ? "🏪" : "🛵"}
        </Text>
        <Text style={styles.info}>
          📞 {t("profile.phone")}: <Text style={styles.bold}>{user.phone}</Text>
        </Text>
      </View>

      {/* Bouton pour éditer le profil */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.editProfileButton, { flex: 1, marginRight: 5 }]}
          onPress={() => setEditModalVisible(true)}
        >
          <Text style={styles.editProfileButtonText}>
            ✏️ {t("buttons.editProfile")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.editProfileButton, { flex: 1, marginLeft: 5 }]}
          onPress={() => setPasswordModalVisible(true)}
        >
          <Text style={styles.editProfileButtonText}>
            🔑 {t("profile.change_password")}
          </Text>
        </TouchableOpacity>
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
          <Text style={styles.languageText}>🇩🇿 العربية</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => {
            Alert.alert(
              "Information",
              "Nous travaillons actuellement à l'ajout de la langue Tmazight. Vous pouvez nous joindre si vous souhaitez plus d'informations :)"
            );
          }}
        >
          <Text style={styles.languageText}>🇩🇿 ⵣ Tmazight</Text>
        </TouchableOpacity>
      </View>

      {/* Bouton Déconnexion */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>🚪 {t("buttons.logout")}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal d'édition du profil */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ Éditer Profil</Text>
            <TextInput
              style={styles.input}
              placeholder={t("profile.email")}
              value={editData.email}
              onChangeText={(text) => setEditData({ ...editData, email: text })}
              keyboardType="email-address"
            />
            <TextInput
              style={styles.input}
              placeholder={t("profile.phone")}
              value={editData.phone}
              onChangeText={(text) => setEditData({ ...editData, phone: text })}
              keyboardType="phone-pad"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.cancelButton, { flex: 1, marginRight: 5 }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>{t("buttons.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.updateButton, { flex: 1, marginLeft: 5 }]}
                onPress={handleSaveProfile}
              >
                <Text style={styles.buttonText}>{t("buttons.save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={passwordModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              🔑 {t("profile.change_password")}
            </Text>

            {/* Ancien mot de passe */}
            <TextInput
              style={styles.input}
              placeholder={t("profile.old_password")}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />

            {/* Nouveau mot de passe */}
            <TextInput
              style={styles.input}
              placeholder={t("profile.new_password")}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            {/* Confirmation du nouveau mot de passe */}
            <TextInput
              style={styles.input}
              placeholder={t("profile.confirm_password")}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />

            {/* Vérification côté front */}
            {newPassword !== "" &&
              confirmPassword !== "" &&
              newPassword !== confirmPassword && (
                <Text style={styles.errorText}>
                  {t("alerts.passwords_do_not_match")}
                </Text>
              )}

            <View style={styles.modalButtonContainer}>
              {/* Bouton Annuler */}
              <TouchableOpacity
                style={[styles.cancelButton, { flex: 1, marginRight: 5 }]}
                onPress={() => setPasswordModalVisible(false)}
              >
                <Text style={styles.buttonText}>{t("buttons.cancel")}</Text>
              </TouchableOpacity>

              {/* Bouton Valider */}
              <TouchableOpacity
                style={[styles.updateButton, { flex: 1, marginLeft: 5 }]}
                onPress={() => {
                  if (newPassword !== confirmPassword) {
                    Alert.alert(
                      t("alerts.error"),
                      t("alerts.passwords_do_not_match")
                    );
                    return;
                  }
                  handleChangePassword();
                }}
              >
                <Text style={styles.buttonText}>{t("buttons.validate")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
  },
  profileBox: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "100%",
    elevation: 3,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
    color: "#555",
  },
  bold: {
    fontWeight: "bold",
    color: "#222",
  },
  logoutContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: "#E74C3C",
    padding: 15,
    borderRadius: 10,
    width: "90%",
    alignItems: "center",
  },
  logoutButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
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
  editProfileButton: {
    backgroundColor: "#F1C40F",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 15,
  },
  editProfileButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    padding: 20,
    backgroundColor: "white",
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "white",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#E74C3C",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButton: {
    backgroundColor: "#F1C40F",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 15,
  },
});
