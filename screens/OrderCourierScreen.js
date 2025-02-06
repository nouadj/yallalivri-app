import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl, Alert } from 'react-native';
import orderService from '../services/orderService';
import { getCurrentUser } from '../services/authService';

export default function OrderCourierScreen() {
  const [user, setUser] = useState(null);
  const [availableOrders, setAvailableOrders] = useState([]); // Commandes "CREATED"
  const [assignedOrders, setAssignedOrders] = useState([]); // Commandes "ASSIGNED"
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const HOURS_LIMIT = 5; // Temps limite pour afficher les commandes disponibles (5h)

  useEffect(() => {
    const fetchUserAndOrders = async () => {
      console.log("🟢 useEffect lancé !");
      const userData = await getCurrentUser();
      if (userData) {
        setUser(userData);
        await fetchCreatedOrders();
        await fetchAssignedOrders(userData.id);
      }
    };
    fetchUserAndOrders();
  }, []);

  // 🔥 Récupérer les commandes "CREATED"
  const fetchCreatedOrders = async () => {
    try {
      console.log("🚀 fetchCreatedOrders() exécuté !");
      setLoading(true);
      const data = await orderService.getCreatedOrders(HOURS_LIMIT);
      console.log("📦 Commandes disponibles après API :", data);
      setAvailableOrders(data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commandes CREATED :', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔥 Récupérer les commandes "ASSIGNED"
  const fetchAssignedOrders = async (courierId) => {
    if (!courierId) return;
    try {
      console.log("🚀 fetchAssignedOrders() exécuté !");
      setLoading(true);
      const data = await orderService.getAssignedOrders(courierId);
      console.log("📦 Commandes ASSIGNED après API :", data);
      setAssignedOrders(data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commandes ASSIGNED :', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // 🔄 Rafraîchir toutes les commandes
  const handleRefresh = async () => {
    if (!user) return;
    setRefreshing(true);
    await fetchCreatedOrders();
    await fetchAssignedOrders(user.id);
  };

  // ✅ Prendre une commande
  const takeOrder = async (orderId) => {
    try {
      if (!user) return;
      await orderService.assignOrderToCourier(orderId, user.id);
      Alert.alert("🎉 Succès", "Commande assignée avec succès !");
      handleRefresh(); // 🔄 Rafraîchir après prise en charge
    } catch (error) {
      if (error.message.includes("Cette commande est déjà assignée")) {
        Alert.alert("⚠️ Échec", "Cette commande a déjà été prise par un autre livreur.");
      } else {
        Alert.alert("⚠️ Erreur", "Impossible d'assigner la commande.");
      }
    }
};

  // 🔥 Mettre à jour le statut d'une commande assignée
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log(`🚀 Mise à jour statut commande ${orderId} vers ${newStatus}`);
      await orderService.updateOrderStatus(orderId, newStatus);
      Alert.alert("🎉 Succès", `Commande mise à jour en ${newStatus} !`);
      
      await fetchAssignedOrders(user.id); // 🔄 Rafraîchir après mise à jour
    } catch (error) {
      Alert.alert("⚠️ Erreur", "Impossible de mettre à jour la commande.");
    }
  };
  

  return (
<View style={styles.container}>

{/* 🔵 Commandes déjà prises */}
<Text style={styles.title}>📦 Mes Commandes Assignées</Text>
{assignedOrders.length === 0 ? (
  <Text style={styles.noOrders}>Aucune commande assignée</Text>
) : (
  <FlatList
    data={assignedOrders}
    keyExtractor={(item) => item.id.toString()}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}

    renderItem={({ item }) => (
      <View style={styles.orderCard}>
 <Text style={styles.orderTitle}>🛍️ {item.customerName}</Text>
      <Text style={styles.orderText}>📍 {item.customerAddress}</Text>
      <Text style={styles.orderText}>📞 {item.customerPhone}</Text>
      <Text style={styles.orderText}>💰 {item.totalAmount} €</Text>
      <Text style={styles.orderStatus}>📌 Statut : {item.status}</Text>
      <Text style={styles.orderDate}>🕒 Dernière mise à jour : {new Date(item.updatedAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
      <Text style={styles.orderDate}>📅 Créée : {new Date(item.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>

        {/* Boutons pour modifier le statut */}
        <TouchableOpacity 
          style={styles.deliveredButton} 
          onPress={() => updateOrderStatus(item.id, "DELIVERED")}
        >
          <Text style={styles.buttonText}>📦 Livré</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.returnedButton} 
          onPress={() => updateOrderStatus(item.id, "RETURNED")}
        >
          <Text style={styles.buttonText}>🔄 Retourné</Text>
        </TouchableOpacity>
      </View>
    )}
  />
)}

{/* 🟢 Commandes Disponibles */}
<Text style={styles.title}>🚚 Commandes Disponibles</Text>
{loading ? (
  <Text>Chargement...</Text>
) : availableOrders.length === 0 ? (
  <Text style={styles.noOrders}>Aucune commande disponible</Text>
) : (
  <FlatList
    data={availableOrders}
    keyExtractor={(item) => item.id.toString()}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
    renderItem={({ item }) => (
      <View style={styles.orderCard}>
        <Text style={styles.orderTitle}>🛍️ {item.customerName}</Text>
        <Text style={styles.orderText}>📍 {item.customerAddress}</Text>
        <Text style={styles.orderText}>📞 {item.customerPhone}</Text>
        <Text style={styles.orderText}>💰 {item.totalAmount} €</Text>
        <Text style={styles.orderStatus}>📌 Statut : {item.status}</Text>

        {/* Bouton "Prendre cette commande" */}
        <TouchableOpacity style={styles.takeButton} onPress={() => takeOrder(item.id)}>
          <Text style={styles.buttonText}>✅ Prendre cette commande</Text>
        </TouchableOpacity>
      </View>
    )}
  />
)}

</View>

  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  noOrders: { textAlign: 'center', fontSize: 18, color: '#777' },
  orderCard: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 10, elevation: 3 },
  orderCardAssigned: { backgroundColor: '#FFD700', padding: 15, marginBottom: 10, borderRadius: 10, elevation: 3 },
  orderTitle: { fontSize: 18, fontWeight: 'bold' },
  orderText: { fontSize: 16 },
  orderStatus: { fontSize: 14, fontStyle: 'italic', color: '#555' },
  takeButton: { backgroundColor: '#3498DB', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  deliveredButton: { backgroundColor: '#2ECC71', padding: 12, borderRadius: 8, alignItems: 'center', flex: 1, marginRight: 5 },
  returnedButton: { backgroundColor: '#E74C3C', padding: 12, borderRadius: 8, alignItems: 'center', flex: 1, marginLeft: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' },
  buttonContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    marginTop: 10, 
    width: '100%',
  },
  deliveredButton: { 
    backgroundColor: '#2ECC71', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    flex: 1, 
    marginRight: 5 
  },
  returnedButton: { 
    backgroundColor: '#E74C3C', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center', 
    flex: 1, 
    marginLeft: 5 
  },
  buttonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold', 
    textAlign: 'center' 
  },
  
});

