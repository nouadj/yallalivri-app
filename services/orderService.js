import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL = "http://192.168.1.32:8080/api/orders";

// ✅ Fonction pour récupérer les en-têtes d'authentification
const getAuthHeaders = async () => {
  const token = await AsyncStorage.getItem("token");
  if (!token) {
    throw new Error("Non Authentifié");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const orderService = {
  // ✅ Récupérer les commandes d'un magasin
  getOrdersForStore: async (storeId, hours = null) => {
    try {
      if (!storeId) throw new Error("❌ Aucun `storeId` fourni !");

      const headers = await getAuthHeaders();
      let url = `${API_BASE_URL}/store/${storeId}`;

      // 🔥 Ajouter `hours` uniquement si une valeur est fournie
      if (hours !== null) {
        url += `?hours=${hours}`;
      }

      console.log(`📡 Envoi requête API : ${url}`);

      const response = await fetch(url, { method: "GET", headers });

      if (!response.ok) throw new Error(`Erreur API : ${response.status}`);
      const data = await response.json();
      console.log("📦 Réponse API commandes STORE :", data);
      return data;
    } catch (error) {
      return [];
    }
  },

  // ✅ Récupérer les commandes par statut et période (ex: "CREATED" des 6 dernières heures)
  getOrdersByStatus: async (status, hours = 6) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(
        `${API_BASE_URL}/status/${status}?hours=${hours}`,
        {
          method: "GET",
          headers,
        }
      );

      if (!response.ok) throw new Error(`Erreur API : ${response.status}`);
      return await response.json();
    } catch (error) {
      return [];
    }
  },

  // ✅ Récupérer uniquement les commandes "CREATED" des dernières X heures
  getCreatedOrders: async (idCourier, hours = 5, distance = 20) => {
    try {
      const headers = await getAuthHeaders();
      
      console.log(
        `📡 Envoi requête API (CREATED) : ${API_BASE_URL}/status/CREATED?idCourier=${idCourier}&distance=${distance}&hours=${hours}`
      );
  
      const response = await fetch(
        `${API_BASE_URL}/status/CREATED?idCourier=${idCourier}&distance=${distance}&hours=${hours}`,
        {
          method: "GET",
          headers,
        }
      );
  
      if (!response.ok) {
        throw new Error(`❌ Erreur API (${response.status})`);
      }
  
      return await response.json(); // ✅ Retourne les commandes filtrées
    } catch (error) {
      throw error;
    }
  },
  

  // ✅ Créer une nouvelle commande (uniquement pour les magasins)
  createOrder: async (orderData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}`, {
        method: "POST",
        headers,
        body: JSON.stringify(orderData),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la création de la commande");
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // ✅ Modifier une commande existante
  updateOrder: async (orderId, orderData) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/${orderId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(orderData),
      });

      if (!response.ok)
        throw new Error("Erreur lors de la modification de la commande");
      return await response.json();
    } catch (error) {
      throw error;
    }
  },

  // ✅ Prendre une commande (le livreur assigne une commande à lui-même)
  assignOrderToCourier: async (orderId, courierId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/${orderId}/assign`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ courierId, status: "ASSIGNED" }),
      });

      const responseData = await response.json();
      if (!response.ok)
        throw new Error(
          responseData.message || "Impossible de prendre la commande"
        );

      return responseData;
    } catch (error) {
      throw error;
    }
  },

  // ✅ Récupérer les commandes assignées à un livreur
  getAssignedOrders: async (courierId) => {
    try {
      if (!courierId) throw new Error("❌ Aucun `courierId` fourni !");

      const headers = await getAuthHeaders();
      const url = `${API_BASE_URL}/courier/${courierId}?status=ASSIGNED`;

      const response = await fetch(url, { method: "GET", headers });

      if (!response.ok) throw new Error(`Erreur API : ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      return [];
    }
  },

  // ✅ Mettre à jour uniquement le statut d'une commande (DELIVERED ou RETURNED)
  updateOrderStatus: async (orderId, status) => {
    try {
      const headers = await getAuthHeaders();
      console.log(
        `📡 Envoi requête API (UPDATE STATUS) : ${API_BASE_URL}/${orderId}/status`
      );

      const response = await fetch(`${API_BASE_URL}/${orderId}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error(`Erreur API : ${response.status}`);
      const data = await response.json();
      return data;
    } catch (error) {
      throw error;
    }
  },
  getArchivedOrders: async (userRole, userId) => {
    try {
      const headers = await getAuthHeaders();
      const endpoint =
        userRole === "STORE"
          ? `${API_BASE_URL}/store/${userId}`
          : `${API_BASE_URL}/courier/${userId}`;


      const response = await fetch(endpoint, { method: "GET", headers });

      if (!response.ok) throw new Error(`Erreur API : ${response.status}`);
      const data = await response.json();

      // 🔥 Filtrer uniquement les commandes "DELIVERED" et "RETURNED"
      return data.filter(
        (order) => order.status === "DELIVERED" || order.status === "RETURNED"
      );
    } catch (error) {
      return [];
    }
  },
  // ✅ Supprimer une commande
  deleteOrder: async (orderId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await fetch(`${API_BASE_URL}/${orderId}`, {
        method: "DELETE",
        headers,
      });
      if (!response.ok) {
        throw new Error(`Erreur API : ${response.status}`);
      }
      // Comme le backend retourne Mono<Void>, il n'y a pas de corps de réponse.
      return;
    } catch (error) {
      throw error;
    }
  },
};

export default orderService;
