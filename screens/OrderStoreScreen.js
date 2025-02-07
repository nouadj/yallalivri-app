import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TextInput, Button, Alert, Modal, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import orderService from '../services/orderService';
import { getCurrentUser } from '../services/authService';
import courierService from '../services/courierService';
import { Linking } from 'react-native';
import { useTranslation } from 'react-i18next';

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
const { t } = useTranslation(); 

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
            Alert.alert(t('alerts.error_courier_details'));
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
      Alert.alert(t('alerts.success_order_created'));
      setModalVisible(false);
      fetchOrders(user.id);
    } catch (error) {
        Alert.alert(t('alerts.error_order_creation'));
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
      Alert.alert(t('alerts.success_order_updated'));
      setModalVisible(false);
      fetchOrders(user.id);
    } catch (error) {
        Alert.alert(t('alerts.error_order_update'));
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

  const handleDeleteOrder = async (orderId) => {
    try {
      await orderService.deleteOrder(orderId);
      Alert.alert(t('alerts.success_order_deleted'));
      // Rechargez la liste des commandes après suppression
      fetchOrders(user.id);
    } catch (error) {
        Alert.alert(t('alerts.error_order_delete'));
    }
  };
  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('orders.store_orders')}</Text>
      <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
        <Text style={styles.addButtonText}>{t('orders.create_order')}</Text>
      </TouchableOpacity>

      {loading ? <Text>{t('orders.loading')}</Text> : (
        <FlatList
  data={orders}
  keyExtractor={(item) => item.id.toString()}
  renderItem={({ item }) => (
    <View style={styles.orderCard}>
      <TouchableOpacity onPress={() => fetchCourierDetails(item.courierId)}>
        <Text style={styles.orderTitle}> 🛵 {item.courierName} </Text>
      </TouchableOpacity>
      <Text style={styles.orderText}>{t('orders.customer')}: {item.customerName}</Text>
      <Text style={styles.orderText}>{t('orders.address')}: {item.customerAddress}</Text>
      <Text style={styles.orderText}>{t('orders.phone')}: {item.customerPhone}</Text>
      <Text style={styles.orderText}>{t('orders.amount')}: {item.totalAmount} {t('amount.dzd')}</Text>
      <Text style={styles.orderStatus}>{t('orders.status')}: {item.status}</Text>
      <Text style={styles.orderDate}>🕒 {t('orders.updated_at')}: {new Date(item.updatedAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
      <Text style={styles.orderDate}>📅 {t('orders.created_at')}: {new Date(item.createdAt).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</Text>
      
      {/* Bouton pour éditer la commande */}
      <TouchableOpacity  onPress={() => openEditModal(item)}
       style={styles.updateButton}>
        <Text style={styles.buttonText}>{t('buttons.update')}</Text>
    </TouchableOpacity>
    {/* Bouton pour annuler la commande */}
    <TouchableOpacity
  style={[styles.cancelButton, { flex: 1, marginLeft: 5 }]}
  onPress={() => {
    Alert.alert(
      t('modals.delete_confirmation'), // "Confirmation de suppression"
      t('modals.delete_message'), // "Voulez-vous vraiment supprimer cette commande ?"
      [
        { text: t('buttons.cancel'), style: 'cancel' }, // "Annuler"
        { text: t('buttons.yes'), onPress: () => handleDeleteOrder(item.id) } // "Oui"
      ],
      { cancelable: true }
    );
  }}
>
  <Text style={styles.buttonText}>{t('buttons.delete')}</Text> 
</TouchableOpacity>

      
      {/* Modal pour les détails du livreur */}
      <Modal visible={courierModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            {courier ? (
              <>
                <Text style={styles.modalTitle}>{t('modals.courier_details')}</Text>
                <Text style={styles.orderText}>{t('modals.courier_name')}: {courier.name}</Text>
                <TouchableOpacity onPress={() => Linking.openURL(`tel:${courier.phone}`)}>
                  <Text style={[styles.orderText, { color: 'blue', textDecorationLine: 'underline' }]}>
                    {t('modals.courier_phone')}: {courier.phone}
                  </Text>
                </TouchableOpacity>
                <Text style={styles.orderText}>{t('modals.courier_age')}: {courier.age}</Text>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setCourierModalVisible(false)}>
                  <Text style={styles.buttonText}>{t('modals.close')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text>{t('orders.loading')}</Text>
            )}
          </View>
        </View>
      </Modal>
    </View>
  )}
/>

      )}

      {/* ✅ Modal pour création/modification */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {currentOrder ? t('buttons.update') : t('buttons.create')}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t('orders.customer')}
              value={formData.customerName}
              onChangeText={(text) => setFormData({ ...formData, customerName: text })}
            />
            <TextInput
              style={styles.input}
              placeholder={t('orders.phone')}
              value={formData.customerPhone}
              onChangeText={(text) => setFormData({ ...formData, customerPhone: text })}
              keyboardType="phone-pad"
            />
            <TextInput
              style={styles.input}
              placeholder={t('orders.address')}
              value={formData.customerAddress}
              onChangeText={(text) => setFormData({ ...formData, customerAddress: text })}
            />
            <TextInput
              style={styles.input}
              placeholder={t('orders.amount')}
              value={formData.totalAmount}
              onChangeText={(text) => setFormData({ ...formData, totalAmount: text })}
              keyboardType="numeric"
            />
            <TouchableOpacity
              style={currentOrder ? styles.updateButton : styles.createButton}
              onPress={currentOrder ? handleUpdateOrder : handleCreateOrder}
            >
              <Text style={styles.buttonText}>{currentOrder ? t('buttons.update') : t('buttons.create')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>{t('buttons.cancel')}</Text>
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
    addButton: { backgroundColor: '#2ECC71', padding: 15, borderRadius: 8, alignItems: 'center', marginBottom: 15 },
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
    updateButton: { backgroundColor: '#2ECC71', padding: 12, borderRadius: 8, alignItems: 'center' },
    cancelButton: { backgroundColor: '#E74C3C', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 },
    buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },

  });
  
  
