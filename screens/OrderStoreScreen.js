import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import orderService from '../services/orderService';
import { getCurrentUser } from '../services/authService';
import courierService from '../services/courierService';
import { Linking } from 'react-native';

export default function OrderStoreScreen() {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    totalAmount: '',
    status: 'CREATED',
  });
const [courier, setCourier] = useState(null);
const [courierModalVisible, setCourierModalVisible] = useState(false);


  useEffect(() => {
    // ✅ Récupérer l'utilisateur connecté
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      console.log("🟢 Utilisateur récupéré :", userData);
      setUser(userData);
      fetchOrders(userData.id); // 🔥 Appel des commandes avec l'ID de l'utilisateur
    };
    fetchUser();
  }, []);

  const fetchOrders = async (storeId) => {
    try {
      setLoading(true);
      const data = await orderService.getOrdersForStore(storeId, 24); // 🔥 Récupère uniquement les commandes des 24h
      setOrders(data);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des commandes :', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  const fetchCourierDetails = async (courierId) => {

    if(courierId!=null) {
        const courierData = await courierService.getCourierById(courierId);
        if (courierData) {
          setCourier(courierData);
          setCourierModalVisible(true);
        } else {
          Alert.alert("Erreur", "Impossible de récupérer les détails du livreur.");
        }
    }

  };
  

  const handleCreateOrder = async () => {
    try {
      if (!user) return;
      const newOrder = {
        storeId: user.id,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        totalAmount: parseFloat(formData.totalAmount),
        status: formData.status,
      };
      await orderService.createOrder(newOrder);
      Alert.alert('Succès', 'Commande créée avec succès');
      setModalVisible(false);
      fetchOrders(user.id);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la commande');
    }
  };

  const handleUpdateOrder = async () => {
    try {
      if (!currentOrder) return;
      const updatedOrder = {
        ...currentOrder,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        totalAmount: parseFloat(formData.totalAmount),
        status: formData.status,
      };
      await orderService.updateOrder(currentOrder.id, updatedOrder);
      Alert.alert('Succès', 'Commande mise à jour avec succès');
      setModalVisible(false);
      fetchOrders(user.id);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de modifier la commande');
    }
  };

  const openEditModal = (order) => {
    setCurrentOrder(order);
    setFormData({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      totalAmount: order.totalAmount.toString(),
      status: order.status,
    });
    setModalVisible(true);
  };

  const openCreateModal = () => {
    setCurrentOrder(null);
    setFormData({
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      totalAmount: '',
      status: 'CREATED',
    });
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📦 Commandes du magasin</Text>
      <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
        <Text style={styles.addButtonText}>➕ Créer une commande</Text>
      </TouchableOpacity>

      {loading ? <Text>Chargement...</Text> : (
<FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
    <View style={styles.orderCard}>
      <TouchableOpacity onPress={() => fetchCourierDetails(item.courierId)}>
        <Text style={styles.orderTitle}> 🛵 {item.courierName} </Text>
      </TouchableOpacity>
      <Text style={styles.orderTitle}>🏠 {item.customerName}</Text>
      <Text style={styles.orderText}>📍 {item.customerAddress}</Text>
      <Text style={styles.orderText}>📞 {item.customerPhone}</Text>
      <Text style={styles.orderText}>💰 {item.totalAmount} Dzd</Text>
      <Text style={styles.orderStatus}>📌 Statut : {item.status}</Text>
      <Text style={styles.orderDate}>🕒 Dernière mise à jour : {new Date(item.updatedAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
      <Text style={styles.orderDate}>📅 Créée : {new Date(item.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
    
    


      <Modal visible={courierModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
             {courier ? (
             <>
                <Text style={styles.modalTitle}>🛵 Détails du livreur</Text>
                <Text style={styles.orderText}>👤 Nom: {courier.name}</Text>
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${courier.phone}`)}>
                <Text style={[styles.orderText]}>
                        📞 Téléphone: {courier.phone}
                </Text>
                </TouchableOpacity>

                <Text style={styles.orderText}>🚀 Age: {courier.age} ans</Text>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setCourierModalVisible(false)}>
                    <Text style={styles.buttonText}>❌ Fermer</Text>
                </TouchableOpacity>
                </>
            ) : (
        <Text>Chargement...</Text>
      )}
    </View>
  </View>
</Modal>



    </View>
  )}
/>



      )}

      {/* Modal pour création/modification */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentOrder ? '✏️ Modifier la commande' : '🆕 Créer une commande'}
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nom du client"
              value={formData.customerName}
              onChangeText={(text) => setFormData({ ...formData, customerName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Téléphone"
              value={formData.customerPhone}
              onChangeText={(text) => setFormData({ ...formData, customerPhone: text })}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder="Adresse"
              value={formData.customerAddress}
              onChangeText={(text) => setFormData({ ...formData, customerAddress: text })}
            />
            <TextInput
              style={styles.input}
              placeholder="Montant total"
              value={formData.totalAmount}
              onChangeText={(text) => setFormData({ ...formData, totalAmount: text })}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={currentOrder ? styles.updateButton : styles.createButton}
              onPress={currentOrder ? handleUpdateOrder : handleCreateOrder}
            >
              <Text style={styles.buttonText}>{currentOrder ? '✅ Mettre à jour' : '✔️ Créer'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>❌ Annuler</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
</View>
  );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, backgroundColor: '#F5F5F5' },
    title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
    addButton: { backgroundColor: '#2ECC71', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
    addButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    orderCard: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 10, elevation: 3 },
    orderTitle: { fontSize: 18, fontWeight: 'bold' },
    orderText: { fontSize: 16 },
    orderStatus: { fontSize: 14, fontStyle: 'italic', color: '#555' },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' },
    modalContent: { width: '85%', padding: 20, backgroundColor: 'white', borderRadius: 12 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 12, borderRadius: 8, marginBottom: 10, backgroundColor: 'white' },
    createButton: { backgroundColor: '#3498DB', padding: 12, borderRadius: 8, alignItems: 'center' },
    updateButton: { backgroundColor: '#F1C40F', padding: 12, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#E74C3C', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  });
  
