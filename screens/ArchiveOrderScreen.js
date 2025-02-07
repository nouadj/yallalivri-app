import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import orderService from "../services/orderService";
import { getCurrentUser } from "../services/authService";
import { useTranslation } from "react-i18next";

export default function ArchiveOrderScreen() {
  const [user, setUser] = useState(null);
  const [archivedOrders, setArchivedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { t } = useTranslation(); // ✅ Hook de traduction

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      console.log("🟢 Chargement de l'utilisateur...");
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
        await fetchArchivedOrders(userData.role, userData.id);
      }
    };
    fetchUserAndOrders();
  }, []);

  // 🔥 Récupérer les commandes archivées
  const fetchArchivedOrders = async (userRole, userId) => {
    try {
      setLoading(true);
      const data = await orderService.getArchivedOrders(userRole, userId);
      console.log("📦 Commandes archivées :", data);
      setArchivedOrders(data);
    } catch (error) {
      console.error(
        "❌ Erreur lors du chargement des commandes archivées :",
        error
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔄 Rafraîchir les archives
  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchArchivedOrders(user.role, user.id);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("orders.archived_orders")}</Text>

      {loading ? (
        <Text>{t("orders.loading")}</Text>
      ) : archivedOrders.length === 0 ? (
        <Text style={styles.noOrders}>{t("orders.no_archived_orders")}</Text>
      ) : (
        <FlatList
          data={archivedOrders}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          renderItem={({ item }) => (
            <View style={styles.orderCard}>
              <Text style={styles.orderTitle}>🛍️ {item.customerName}</Text>
              <Text style={styles.orderText}>
                📍 {t("orders.address")}: {item.customerAddress}
              </Text>
              <Text style={styles.orderText}>
                📞 {t("orders.phone")}: {item.customerPhone}
              </Text>
              <Text style={styles.orderText}>
                💰 {t("orders.amount")}: {item.amount} Dzd
              </Text>
              <Text style={styles.orderText}>
                💰 {t("orders.deliveryFee")}: {item.amount} Dzd
              </Text>
              <Text style={styles.orderDate}>
                🕒 {t("orders.updated_at")}:{" "}
                {new Date(item.updatedAt).toLocaleString()}
              </Text>
              <Text style={styles.orderDate}>
                📅 {t("orders.created_at")}:{" "}
                {new Date(item.createdAt).toLocaleString()}
              </Text>
              <Text
                style={[
                  styles.orderStatus,
                  {
                    color: item.status === "DELIVERED" ? "#2ECC71" : "#E74C3C",
                  },
                ]}
              >
                📌 {t(`statuses.${item.status}`)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#F5F5F5" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  noOrders: { textAlign: "center", fontSize: 18, color: "#777" },
  orderCard: {
    backgroundColor: "white",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
  },
  orderTitle: { fontSize: 18, fontWeight: "bold" },
  orderText: { fontSize: 16 },
  orderStatus: { fontSize: 14, fontStyle: "italic", fontWeight: "bold" },
});
