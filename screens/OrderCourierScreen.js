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
  Linking,
  Image
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { useTranslation } from "react-i18next";

// Services
import orderService from "../services/orderService";
import storeService from "../services/storeService";
import { getCurrentUser } from "../services/authService";
import { updateUserLocation } from "../services/locationService";

export default function OrderCourierScreen() {
  const [user, setUser] = useState(null);

  // Listes de commandes
  const [availableOrders, setAvailableOrders] = useState([]); // Commandes "CREATED"
  const [assignedOrders, setAssignedOrders] = useState([]);  // Commandes "ASSIGNED"

  // Informations sur le magasin (Modal)
  const [store, setStore] = useState(null);
  const [storeModalVisible, setStoreModalVisible] = useState(false);

  // UI states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { t } = useTranslation();

  // 1) Récupération de l'utilisateur (livreur) + commandes au montage
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      if (!userData) return;

      setUser(userData);

      // Récupérer les commandes
      await fetchCreatedOrders();
      await fetchAssignedOrders(userData.id);
    };
    fetchUser();
  }, []);

  // 2) Mise à jour automatique de la position du livreur toutes les 10 secondes
  useEffect(() => {
    if (!user) return;

    const locationInterval = setInterval(() => {
      updateUserLocation(user.id);  // Envoi la position GPS
    }, 10000); // 10s

    return () => clearInterval(locationInterval);
  }, [user]);

  // 3) Rafraîchissement automatique des commandes toutes les 60 secondes
  useEffect(() => {
    if (!user) return;

    const ordersInterval = setInterval(() => {
      fetchCreatedOrders();
      fetchAssignedOrders(user.id);
    }, 60000); // 60s

    return () => clearInterval(ordersInterval);
  }, [user]);

  // ─────────────────────────────────────────────────────────────────────
  // FETCH COMMANDES
  // ─────────────────────────────────────────────────────────────────────
  const fetchCreatedOrders = async () => {
    try {
      setLoading(true);
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        setLoading(false);
        return;
      }
      const data = await orderService.getCreatedOrders(currentUser.id, 5, 20);
      setAvailableOrders(data);
    } catch (error) {
      console.error("Erreur fetchCreatedOrders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchAssignedOrders = async (courierId) => {
    try {
      setLoading(true);
      const data = await orderService.getAssignedOrders(courierId);
      setAssignedOrders(data);
    } catch (error) {
      console.error("Erreur fetchAssignedOrders:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // STORE DETAILS
  // ─────────────────────────────────────────────────────────────────────
  const fetchStoreDetails = async (storeId) => {
    try {
      if (!storeId) return;
      const storeData = await storeService.getStoreById(storeId);
      if (storeData) {
        setStore(storeData);
        setStoreModalVisible(true);
      } else {
        Alert.alert("Erreur", "Impossible de récupérer les détails du magasin.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Non autorisé ou problème serveur.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // REFRESH
  // ─────────────────────────────────────────────────────────────────────
  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchCreatedOrders();
    await fetchAssignedOrders(user.id);
  };

  // ─────────────────────────────────────────────────────────────────────
  // TAKE ORDER
  // ─────────────────────────────────────────────────────────────────────
  const takeOrder = async (orderId) => {
    try {
      if (!user) return;
      await orderService.assignOrderToCourier(orderId, user.id);
      Alert.alert("🎉 Succès", "Commande assignée avec succès !");
      handleRefresh();
    } catch (error) {
      if (error.message.includes("Cette commande est déjà assignée")) {
        Alert.alert("⚠️ Échec", "Cette commande a déjà été prise par un autre livreur.");
      } else {
        Alert.alert("⚠️ Erreur", "Impossible d'assigner la commande.");
      }
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // UPDATE ORDER STATUS
  // ─────────────────────────────────────────────────────────────────────
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      Alert.alert("🎉 Succès", `Commande mise à jour en ${newStatus} !`);
      await fetchAssignedOrders(user.id);
    } catch (error) {
      Alert.alert("⚠️ Erreur", "Impossible de mettre à jour la commande.");
    }
  };

  // ─────────────────────────────────────────────────────────────────────
  // CALL
  // ─────────────────────────────────────────────────────────────────────
  const handleCall = (phoneNumber) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  // ─────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────
  if (!user) return <Text style={styles.loading}>{t("orders.loading")}</Text>;

  return (
    <View style={styles.container}>
      {/* Commandes déjà prises */}
      <Text style={styles.title}>{t("orders.assigned_orders")}</Text>
      {assignedOrders.length === 0 ? (
        <Text style={styles.noOrders}>{t("orders.no_assigned_orders")}</Text>
      ) : (
        <FlatList
          data={assignedOrders}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              {/* Nom du magasin -> détails + carte */}
              <TouchableOpacity onPress={() => fetchStoreDetails(item.storeId)}>
                <Text style={styles.orderTitle}>🏪 {item.storeName}</Text>
              </TouchableOpacity>

              <Text style={styles.orderText}>
                {item.customerName} 🏠🛵 {item.customerAddress}
              </Text>
              {/* Téléphone client */}
              <Text style={styles.orderText} onPress={() => handleCall(item.customerPhone)}>
                📞 {item.customerPhone}
              </Text>
              {/* Montant & frais de livraison */}
              <Text style={styles.orderText}>
                💰 {item.amount} {t("amount.dzd")}
              </Text>
              <Text style={styles.orderText}>
                💰 {item.deliveryFee} {t("amount.dzd")}
              </Text>
              <Text style={styles.orderText}>
                {t("orders.totalWithDelivery")}: {item.amount + item.deliveryFee} {t("amount.dzd")}
              </Text>

              <Text style={styles.orderStatus}>
                {t("orders.status")}: {t(`statuses.${item.status}`)}
              </Text>
              <Text style={styles.orderDate}>
                🕒 {t("orders.updated_at")}: {new Date(item.updatedAt).toLocaleString()}
              </Text>
              <Text style={styles.orderDate}>
                📅 {t("orders.created_at")}: {new Date(item.createdAt).toLocaleString()}
              </Text>

              {/* Boutons pour modifier le statut -> DELIVERED / RETURNED */}
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.deliveredButton}
                  onPress={() => updateOrderStatus(item.id, "DELIVERED")}
                >
                  <Text style={styles.buttonText}>📦 {t("buttons.delivered")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.returnedButton}
                  onPress={() => updateOrderStatus(item.id, "RETURNED")}
                >
                  <Text style={styles.buttonText}>🔄 {t("buttons.returned")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* 🏪 Modal : détails du magasin + carte */}
      <Modal visible={storeModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {store && user ? (
              <>
                <Text style={styles.modalTitle}>🏪 {t("modals.store_details")}</Text>

                <View style={styles.infoContainer}>
                  <Text style={styles.label}>📍 {t("modals.store_address")} :</Text>
                  <Text style={styles.orderText}>{store.address}</Text>
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.label}>📞 {t("modals.store_phone")} :</Text>
                  <TouchableOpacity onPress={() => Linking.openURL(`tel:${store.phone}`)}>
                    <Text style={styles.orderText}>{store.phone}</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.infoContainer}>
                  <Text style={styles.label}>📦 {t("modals.store_type")} :</Text>
                  <Text style={styles.orderText}>{store.type}</Text>
                </View>

                {/* Carte store + livreur */}
                {store.latitude && store.longitude && user.latitude && user.longitude ? (
                  <MapView
                    style={styles.map}
                    initialRegion={{
                      latitude: (store.latitude + user.latitude) / 2,
                      longitude: (store.longitude + user.longitude) / 2,
                      latitudeDelta: Math.abs(store.latitude - user.latitude) + 0.05,
                      longitudeDelta: Math.abs(store.longitude - user.longitude) + 0.05,
                    }}
                  >
                    {/* Marqueur du store */}
                    <Marker
                      coordinate={{ latitude: store.latitude, longitude: store.longitude }}
                      title={store.name}
                      description={t("modals.store_location")}
                    >
                      <Image
                        source={require("../assets/store.png")} // Icône du magasin
                        style={{ width: 30, height: 22 }}
                        resizeMode="contain"
                      />
                    </Marker>

                    {/* Marqueur du livreur */}
                    <Marker
                      coordinate={{ latitude: user.latitude, longitude: user.longitude }}
                      title={t("modals.your_location")}
                      description="Votre position"
                    >
                      <Image
                        source={require("../assets/tmax.png")} // Icône livreur (moto)
                        style={{ width: 30, height: 22 }}
                        resizeMode="contain"
                      />
                    </Marker>
                  </MapView>
                ) : (
                  <Text style={styles.warning}>📌 {t("modals.no_location")}</Text>
                )}

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setStoreModalVisible(false)}
                >
                  <Text style={styles.buttonText}>❌ {t("buttons.close")}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.loading}>{t("orders.loading")}</Text>
            )}
          </View>
        </View>
      </Modal>

      {/* 🟢 Commandes Disponibles */}
      <Text style={styles.title}>🚚 {t("orders.available_orders")}</Text>
      {loading ? (
        <Text>{t("orders.loading")}</Text>
      ) : availableOrders.length === 0 ? (
        <Text style={styles.noOrders}>{t("orders.no_available_orders")}</Text>
      ) : (
        <FlatList
          data={availableOrders}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              {/* Nom du magasin -> détails + carte */}
              <TouchableOpacity onPress={() => fetchStoreDetails(item.storeId)}>
                <Text style={styles.orderTitle}>🏪 {item.storeName}</Text>
              </TouchableOpacity>

              <Text style={styles.orderTitle}>
                {item.customerName} 🏠🛵 {item.customerAddress}
              </Text>
              <Text style={styles.orderText} onPress={() => handleCall(item.customerPhone)}>
                📞 {item.customerPhone}
              </Text>
              <Text style={styles.orderText}>
                💰 {item.amount} {t("amount.dzd")}
              </Text>
              <Text style={styles.orderText}>
                💰 {item.deliveryFee} {t("amount.dzd")}
              </Text>
              <Text style={styles.orderText}>
                {t("orders.totalWithDelivery")}: {item.amount + item.deliveryFee} {t("amount.dzd")}
              </Text>
              <Text style={styles.orderStatus}>
                {t("orders.status")}: {t(`statuses.${item.status}`)}
              </Text>
              <Text style={styles.orderDate}>
                🕒 {t("orders.updated_at")}: {new Date(item.updatedAt).toLocaleString()}
              </Text>
              <Text style={styles.orderDate}>
                📅 {t("orders.created_at")}: {new Date(item.createdAt).toLocaleString()}
              </Text>

              {/* Prendre la commande */}
              <TouchableOpacity
                style={styles.takeButton}
                onPress={() => takeOrder(item.id)}
              >
                <Text style={styles.buttonText}>
                  ✅ {t("buttons.take_order")}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5",
  },
  loading: {
    textAlign: "center",
    marginTop: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  noOrders: {
    textAlign: "center",
    fontSize: 18,
    color: "#777",
  },
  orderCard: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  orderText: {
    fontSize: 16,
    color: "#333",
  },
  orderStatus: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
  },
  orderDate: {
    fontSize: 14,
    color: "#777",
  },
  takeButton: {
    backgroundColor: "#3498DB",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  deliveredButton: {
    backgroundColor: "#2ECC71",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginRight: 5,
  },
  returnedButton: {
    backgroundColor: "#E74C3C",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    flex: 1,
    marginLeft: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
  infoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  label: {
    fontWeight: "bold",
    fontSize: 16,
    marginRight: 5,
  },
  cancelButton: {
    backgroundColor: "#E74C3C",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
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
