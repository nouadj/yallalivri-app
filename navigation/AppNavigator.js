import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

// Import des écrans
import LoginScreen from '../screens/LoginScreen';
import ProfileScreen from '../screens/ProfileScreen';
import OrderStoreScreen from '../screens/OrderStoreScreen';
import OrderCourierScreen from '../screens/OrderCourierScreen';
import ArchiveOrderScreen from '../screens/ArchiveOrderScreen';

import { getCurrentUser } from '../services/authService';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * 🏠 Menu principal avec icônes et mise à jour du rôle
 */
function HomeTabs({ route }) {
  const [user, setUser] = useState(route.params?.user || null);
  const [loading, setLoading] = useState(!user);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      console.log("🟢 Utilisateur récupéré :", userData);
      setUser(userData);
      setLoading(false);
    };

    if (!user) fetchUser();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            case 'Orders':
              iconName = 'cart'; // 🛒 Icône pour l'onglet commandes
              break;
            default:
              iconName = 'help-circle';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'blue',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      {user?.role === "STORE" && (
        <Tab.Screen name="Orders" component={OrderStoreScreen} initialParams={{ storeId: user?.id }} />
      )}
      {user?.role === "COURIER" && (
      <Tab.Screen
      name="OrdersCourier"
      component={OrderCourierScreen}
      options={{ title: "Commandes Livreur" }}
    />
    
    
)}
<Tab.Screen name="Profile" component={ProfileScreen} />
<Tab.Screen name="Archives" component={ArchiveOrderScreen} />

    </Tab.Navigator>
  );
}

/**
 * 🚀 Navigation principale avec gestion de connexion
 */
export default function AppNavigator({ initialRoute }) {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="HomeTabs" component={HomeTabs} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
