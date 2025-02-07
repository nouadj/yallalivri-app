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
import { updateUserLocation } from "../services/locationService";

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({ email: "", phone: "" });
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { t } = useTranslation();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      if (userData) setEditData({ email: userData.email, phone: userData.phone });
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigation.replace("Login");
  };

  const handleSaveProfile = async () => {
    if (!editData.email || !editData.phone) {
      Alert.alert(t("alerts.error_profile_update"), t("alerts.fill_all_fields"));
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
    if (newPassword !== confirmPassword) {
      Alert.alert(t("alerts.error"), t("alerts.passwords_do_not_match"));
      return;
    }
    try {
      await updatePassword(user.id, oldPassword, newPassword);
      Alert.alert(t("alerts.success_password_updated"));
      setPasswordModalVisible(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      Alert.alert(t("alerts.error_password_update"));
    }
  };

  if (!user) return <Text>Chargement...</Text>;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>👤 {t("profile.title") || "Profil"}</Text>
      </View>

      {/* Informations utilisateur */}
      <View style={styles.box}>
        <Text style={styles.info}>📛 {t("profile.name")}: <Text style={styles.bold}>{user.name}</Text></Text>
        <Text style={styles.info}>📧 {t("profile.email")}: <Text style={styles.bold}>{user.email}</Text></Text>
        <Text style={styles.info}>
          {t("profile.role")}: <Text style={styles.bold}>{t(`roles.${user.role.toLowerCase()}`)}</Text>{" "}
          {user.role === "STORE" ? "🏪" : "🛵"}
        </Text>
        <Text style={styles.info}>📞 {t("profile.phone")}: <Text style={styles.bold}>{user.phone}</Text></Text>
      </View>

      {/* Boutons d'actions */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={() => setEditModalVisible(true)}>
          <Text style={styles.btnText}>✏️ {t("buttons.editProfile")}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => setPasswordModalVisible(true)}>
          <Text style={styles.btnText}>🔑 {t("profile.change_password")}</Text>
        </TouchableOpacity>
      </View>

      {/* Informations de localisation */}
      <View style={styles.box}>
        <Text style={styles.info}>
          📍 {t("location.current")}: <Text style={styles.bold}>{user?.latitude}, {user?.longitude}</Text>
        </Text>
        <TouchableOpacity style={styles.locationButton} onPress={() => updateUserLocation(user?.id)}>
          <Text style={styles.btnText}>🔄 {t("location.update")}</Text>
        </TouchableOpacity>
      </View>

      {/* Sélection de la langue */}
      <View style={styles.row}>
        <TouchableOpacity style={styles.langButton} onPress={() => changeLanguage("en")}>
          <Text style={styles.btnText}>🇬🇧 English</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.langButton} onPress={() => changeLanguage("fr")}>
          <Text style={styles.btnText}>🇫🇷 Français</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.langButton} onPress={() => changeLanguage("ar")}>
          <Text style={styles.btnText}>🇩🇿 العربية</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.langButton}
          onPress={() =>
            Alert.alert(
              "Info",
              "Nous travaillons actuellement à l'ajout de la langue Tmazight. Vous pouvez nous joindre si vous souhaitez plus d'informations :)"
            )
          }
        >
          <Text style={styles.btnText}>🇩🇿 ⵣ Tmazight</Text>
        </TouchableOpacity>
      </View>

      {/* Bouton déconnexion */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.btnText}>🚪 {t("buttons.logout")}</Text>
      </TouchableOpacity>

      {/* Modal d'édition du profil */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>✏️ {t("buttons.editProfile")}</Text>
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
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setEditModalVisible(false)}>
                <Text style={styles.btnText}>{t("buttons.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleSaveProfile}>
                <Text style={styles.btnText}>{t("buttons.save")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de changement de mot de passe */}
      <Modal visible={passwordModalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>🔑 {t("profile.change_password")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("profile.old_password")}
              secureTextEntry
              value={oldPassword}
              onChangeText={setOldPassword}
            />
            <TextInput
              style={styles.input}
              placeholder={t("profile.new_password")}
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <TextInput
              style={styles.input}
              placeholder={t("profile.confirm_password")}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {newPassword && confirmPassword && newPassword !== confirmPassword && (
              <Text style={styles.errorText}>{t("alerts.passwords_do_not_match")}</Text>
            )}
            <View style={styles.modalRow}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setPasswordModalVisible(false)}>
                <Text style={styles.btnText}>{t("buttons.cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={handleChangePassword}>
                <Text style={styles.btnText}>{t("buttons.validate")}</Text>
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
    padding: 15,
    backgroundColor: "#F5F5F5",
    justifyContent: "space-between",
  },
  header: { alignItems: "center", marginVertical: 10 },
  title: { fontSize: 24, fontWeight: "bold", color: "#333" },
  box: {
    backgroundColor: "#FFF",
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 10,
  },
  info: { fontSize: 16, color: "#555", marginVertical: 2 },
  bold: { fontWeight: "bold", color: "#222" },
  row: { flexDirection: "row", justifyContent: "space-between", marginVertical: 10 },
  button: {
    backgroundColor: "#F1C40F",
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  langButton: {
    backgroundColor: "#3498DB",
    flex: 1,
    marginHorizontal: 3,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  logoutButton: {
    backgroundColor: "#E74C3C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginVertical: 10,
  },
  btnText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 15,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", textAlign: "center", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    marginVertical: 5,
  },
  modalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  modalButton: {
    backgroundColor: "#F1C40F",
    flex: 1,
    marginHorizontal: 5,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: "center",
  },
  errorText: { color: "red", textAlign: "center", marginVertical: 5 },
  locationButton: {
    backgroundColor: "#2ECC71",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
});

