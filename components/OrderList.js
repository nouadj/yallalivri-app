// OrderList.js
import React from 'react';
import { FlatList, View } from 'react-native';
import OrderCard from './OrderCard';

const OrderList = ({ orders }) => {
  return (
    <View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <OrderCard item={item} />}
      />
    </View>
  );
};

export default OrderList;
