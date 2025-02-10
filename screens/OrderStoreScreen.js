import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
  TextInput,
  Linking,
  Image,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTranslation } from "react-i18next";

// Services
import orderService from "../services/orderService";
import courierService from "../services/courierService";
import { getCurrentUser } from "../services/authService";

// Le Store n'a pas besoin de `updateUserLocation`, puisqu'il ne bouge pas.
// On l'importe uniquement si on veut forcer un update, ex: import { updateUserLocation } from "../services/locationService";

export default function OrderStoreScreen() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Pour créer/éditer une commande
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    amount: "",
    deliveryFee: "50",
    status: "CREATED",
  });

  // Détails du courier (affichage modal + carte)
  const [courier, setCourier] = useState(null);
  const [courierModalVisible, setCourierModalVisible] = useState(false);

  const { t } = useTranslation();

  // 1) Récupérer l'utilisateur (STORE) + ses commandes
  useEffect(() => {
    const initStore = async () => {
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
        // Récupération de ses commandes
        fetchOrders(userData.id);
      }
    };
    initStore();
  }, []);

  // 2) (Optionnel) Rafraîchissement automatique toutes les X secondes
  //    Si tu veux, par ex. toutes les 60s
  // useEffect(() => {
  //   if (!user) return;
  //   const ordersInterval = setInterval(() => {
  //     fetchOrders(user.id);
  //   }, 60000); // 60 secondes
  //   return () => clearInterval(ordersInterval);
  // }, [user]);

  // Récupérer les commandes du STORE
  const fetchOrders = async (storeId) => {
    try {
      setLoading(true);
      const data = await orderService.getOrdersForStore(storeId, 24);
      setOrders(data);
    } catch (error) {
      console.error("Erreur fetchOrders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Pull to refresh
  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchOrders(user.id);
  };

  // Récupérer la position du courrier (et ses infos)
  const fetchCourierDetails = async (courierId) => {
    try {
      if (!courierId) return;
      const courierData = await courierService.getCourierById(courierId);
      if (courierData) {
        setCourier(courierData);
        setCourierModalVisible(true);
      } else {
        Alert.alert(t("alerts.error_courier_details"));
      }
    } catch (error) {
      Alert.alert("Erreur", "Impossible de récupérer le courier");
    }
  };

  // 📞 Appeler un numéro
  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // ➕ Créer une commande
  const handleCreateOrder = async () => {
    try {
      if (!user) return;
      const newOrder = {
        storeId: user.id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        amount: parseFloat(formData.amount),
        deliveryFee: parseFloat(formData.deliveryFee),
        status: formData.status,
      };
      await orderService.createOrder(newOrder);
      Alert.alert(t("alerts.success_order_created"));
      setModalVisible(false);
      fetchOrders(user.id);
    } catch (error) {
      Alert.alert(t("alerts.error_order_creation"));
    }
  };

  // ✏️ Mettre à jour une commande
  const handleUpdateOrder = async () => {
    try {
      if (!currentOrder) return;
      const updatedOrder = {
        ...currentOrder,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        amount: parseFloat(formData.amount),
        deliveryFee: parseFloat(formData.deliveryFee),
        status: formData.status,
      };
      await orderService.updateOrder(currentOrder.id, updatedOrder);
      Alert.alert(t("alerts.success_order_updated"));
      setModalVisible(false);
      fetchOrders(user.id);
    } catch (error) {
      Alert.alert(t("alerts.error_order_update"));
    }
  };

  // 🗑️ Supprimer une commande
  const handleDeleteOrder = async (orderId) => {
    try {
      await orderService.deleteOrder(orderId);
      Alert.alert(t("alerts.success_order_deleted"));
      fetchOrders(user.id);
    } catch (error) {
      Alert.alert(t("alerts.error_order_delete"));
    }
  };

  // ➕ Ouvrir le modal en mode création
  const openCreateModal = () => {
    setCurrentOrder(null);
    setFormData({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      amount: "",
      deliveryFee: "50",
      status: "CREATED",
    });
    setModalVisible(true);
  };

  // ✏️ Ouvrir le modal en mode édition
  const openEditModal = (order) => {
    setCurrentOrder(order);
    setFormData({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      amount: String(order.amount),
      deliveryFee: String(order.deliveryFee),
      status: order.status,
    });
    setModalVisible(true);
  };

  if (!user) return <Text style={styles.loading}>{t("orders.loading")}</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("orders.store_orders")}</Text>

      {/* Bouton pour créer une commande */}
      <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
        <Text style={styles.addButtonText}>{t("orders.create_order")}</Text>
      </TouchableOpacity>

      {/* Liste des commandes */}
      {loading ? (
        <Text style={styles.loading}>{t("orders.loading")}</Text>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              {/* Affiche le courier => modal + map */}
              <TouchableOpacity onPress={() => fetchCourierDetails(item.courierId)}>
                <Text style={styles.orderTitle}>🛵 {item.courierName}</Text>
              </TouchableOpacity>

              <Text style={styles.orderText}>{t("orders.customer")}: {item.customerName}</Text>
              <Text style={styles.orderText}>{t("orders.address")}: {item.customerAddress}</Text>
              <Text style={styles.orderText} onPress={() => handleCall(item.customerPhone)}>
                📞 {t("orders.phone")}: {item.customerPhone}
              </Text>

              <Text style={styles.orderText}>
                💰 {t("orders.amount")}: {item.amount} {t("amount.dzd")}
              </Text>
              <Text style={styles.orderText}>
                💰 {t("orders.deliveryFee")}: {item.deliveryFee} {t("amount.dzd")}
              </Text>
              <Text style={styles.orderText}>
                {t("orders.totalWithDelivery")}: {item.amount + item.deliveryFee} {t("amount.dzd")}
              </Text>

              <Text style={styles.orderText}>
                {t("orders.status")}: {t(`statuses.${item.status}`)}
              </Text>
              <Text style={styles.orderDate}>
                🕒 {t("orders.updated_at")}:{" "}
                {new Date(item.updatedAt).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
              <Text style={styles.orderDate}>
                📅 {t("orders.created_at")}:{" "}
                {new Date(item.createdAt).toLocaleString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>

              {/* Boutons => Éditer ou Supprimer */}
              <View style={{ flexDirection: "row", marginTop: 10 }}>
                <TouchableOpacity
                  style={[styles.updateButton, { flex: 1, marginRight: 5 }]}
                  onPress={() => openEditModal(item)}
                >
                  <Text style={styles.buttonText}>{t("buttons.update")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.cancelButton, { flex: 1, marginLeft: 5 }]}
                  onPress={() => {
                    Alert.alert(
                      t("modals.delete_confirmation"),
                      t("modals.delete_message"),
                      [
                        { text: t("buttons.cancel"), style: "cancel" },
                        {
                          text: t("buttons.yes"),
                          onPress: () => handleDeleteOrder(item.id),
                        },
                      ],
                      { cancelable: true }
                    );
                  }}
                >
                  <Text style={styles.buttonText}>{t("buttons.delete")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Modal => détails du courier (carte liv. + store) */}
      <Modal
        visible={courierModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {courier && user ? (
              <>
                <Text style={styles.modalTitle}>{t("modals.courier_details")}</Text>
                <Text style={styles.orderText}>
                  {t("modals.courier_name")}: {courier.name}
                </Text>
                {/* Appeler le courier */}
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${courier.phone}`)}>
                  <Text>📞 {t("modals.courier_phone")}: {courier.phone}</Text>
                </TouchableOpacity>

                <Text style={styles.orderText}>
                  {t("modals.courier_age")}: {courier.dateOfBirth}
                </Text>

                {/* Carte => courier + store */}
                {courier.latitude && courier.longitude && user.latitude && user.longitude ? (
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: (courier.latitude + user.latitude) / 2,
                      longitude: (courier.longitude + user.longitude) / 2,
                      latitudeDelta: Math.abs(courier.latitude - user.latitude) + 0.05,
                      longitudeDelta: Math.abs(courier.longitude - user.longitude) + 0.05,
                    }}
                  >
                    {/* Marqueur du courier */}
                    <Marker
                      coordinate={{ latitude: courier.latitude, longitude: courier.longitude }}
                      title={courier.name}
                      description={t("modals.courier_location")}
                    >
                      <Image
                        source={require("../assets/tmax.png")} // icône moto
                        style={{ width: 30, height: 22 }}
                        resizeMode="contain"
                      />
                    </Marker>

                    {/* Marqueur du store (user) */}
                    <Marker
                      coordinate={{ latitude: user.latitude, longitude: user.longitude }}
                      title={t("modals.your_location")}
                      description="Votre store"
                    >
                      <Image
                        source={require("../assets/store.png")} // icône store
                        style={{ width: 30, height: 22 }}
                        resizeMode="contain"
                      />
                    </Marker>
                  </MapView>
                ) : (
                  <Text style={styles.warning}>{t("modals.no_location")}</Text>
                )}

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setCourierModalVisible(false)}
                >
                  <Text style={styles.buttonText}>{t("buttons.close")}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.loading}>{t("orders.loading")}</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal => Créer/éditer une commande */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentOrder ? t("buttons.update") : t("buttons.create")}
            </Text>

            <TextInput
              style={styles.input}
              placeholder={t("orders.customer")}
              value={formData.customerName}
              onChangeText={(text) => setFormData({ ...formData, customerName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder={t("orders.phone")}
              value={formData.customerPhone}
              onChangeText={(text) => setFormData({ ...formData, customerPhone: text })}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder={t("orders.address")}
              value={formData.customerAddress}
              onChangeText={(text) => setFormData({ ...formData, customerAddress: text })}
            />
            <TextInput
              style={styles.input}
              placeholder={t("orders.amount")}
              value={formData.amount}
              onChangeText={(text) => setFormData({ ...formData, amount: text })}
              keyboardType="numeric"
            />
            <TextInput
              style={styles.input}
              placeholder={t("orders.deliveryFee")}
              value={formData.deliveryFee}
              onChangeText={(text) => setFormData({ ...formData, deliveryFee: text })}
              keyboardType="numeric"
            />

            <TouchableOpacity
              style={currentOrder ? styles.updateButton : styles.createButton}
              onPress={currentOrder ? handleUpdateOrder : handleCreateOrder}
            >
              <Text style={styles.buttonText}>
                {currentOrder ? t("buttons.update") : t("buttons.create")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>{t("buttons.cancel")}</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
  loading: { textAlign: "center", marginTop: 20 },
  title: { fontSize: 22, fontWeight: "bold", textAlign: "center", marginBottom: 20 },
  addButton: {
    backgroundColor: "#2ECC71",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  addButtonText: { color: "white", fontSize: 18, fontWeight: "bold" },
  orderCard: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },
  orderTitle: { fontSize: 18, fontWeight: "bold" },
  orderText: { fontSize: 16, color: "#333" },
  orderStatus: { fontSize: 14, fontStyle: "italic", color: "#555" },
  orderDate: { fontSize: 14, color: "#777" },
  createButton: {
    backgroundColor: "#3498DB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButton: {
    backgroundColor: "#2ECC71",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  cancelButton: {
    backgroundColor: "#E74C3C",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
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
  map: {
    width: "100%",
    height: 250,
    marginVertical: 10,
    borderRadius: 8,
  },
  warning: {
    color: "red",
    textAlign: "center",
    marginVertical: 10,
  },
});
