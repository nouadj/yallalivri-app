// OrderCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const OrderCard = ({ item }) => {
  // Fonction utilitaire pour formater la date
  const formatDate = (date) =>
    new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <View style={styles.orderCard}>
      <Text style={styles.orderTitle}>🛍️ {item.customerName}</Text>
      <Text style={styles.orderText}>📍 {item.customerAddress}</Text>
      <Text style={styles.orderText}>📞 {item.customerPhone}</Text>
      <Text style={styles.orderText}>💰 {item.amount} Dzd</Text>
      <Text style={styles.orderStatus}>📌 Statut : {item.status}</Text>
      <Text style={styles.orderDate}>
        🕒 Dernière mise à jour : {formatDate(item.updatedAt)}
      </Text>
      <Text style={styles.orderDate}>
        📅 Créée : {formatDate(item.createdAt)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  orderCard: {
    // Définissez ici le style de la carte
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    elevation: 2, // pour Android
    shadowColor: '#000', // pour iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  orderText: {
    fontSize: 16,
    marginBottom: 3,
  },
  orderStatus: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 3,
  },
  orderDate: {
    fontSize: 14,
    color: '#555',
  },
});

export default OrderCard;
