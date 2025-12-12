import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';

import OrderItem from '../src/components/OrderItem';
import { API_BASE_URL, COLORS } from '../src/constants';

const OrdersScreen = () => {
  const params = useLocalSearchParams(); 
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Orders API
  const fetchOrders = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            const sortedOrders = data.data ? [...data.data].reverse() : [];
            setOrders(sortedOrders);
            // Mặc định hiển thị hết
            setFilteredOrders(sortedOrders); 
        }
    } catch (error) {
        console.error("Connection Error:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  // 2. Tự động tìm kiếm khi có Order ID từ Notification
  useEffect(() => {
      if (params?.orderId && orders.length > 0) {
          console.log("🔔 Notification mở đơn hàng:", params.orderId);
          setSearchText(params.orderId);
          handleSearch(params.orderId, orders);
      }
  }, [params?.orderId, orders]); 

  // 3. Search Function
  const handleSearch = (text, currentList = orders) => {
      setSearchText(text);
      if (text) {
          const newData = currentList.filter(item => {
              const idMatch = item._id.toUpperCase().includes(text.toUpperCase());
              const nameMatch = item.user?.name?.toUpperCase().includes(text.toUpperCase());
              return idMatch || nameMatch;
          });
          setFilteredOrders(newData);
      } else {
          setFilteredOrders(currentList);
      }
  };

  // 4. Update Status Logic
  const handleUpdateStatus = async (item) => {
    const statusFlow = { 'pending': 'processing', 'processing': 'shipped', 'shipped': 'delivered' };
    const nextStatus = statusFlow[item.status];
    if (!nextStatus) return; 

    if (Platform.OS === 'web') {
        const confirm = window.confirm(`Update Order #${item._id.slice(-6)} to "${nextStatus.toUpperCase()}"?`);
        if (!confirm) return;
    }

    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/orders/${item._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ status: nextStatus })
        });
        
        const data = await response.json();
        if (data.success) {
            const updateList = (list) => list.map(order => 
                order._id === item._id ? { ...order, status: nextStatus } : order
            );
            setOrders(prev => updateList(prev));
            setFilteredOrders(prev => updateList(prev));
            if (Platform.OS === 'web') alert("Status updated successfully!");
        } else {
            alert("Server Error: " + data.message);
        }
    } catch (error) {
        console.error("Update Error:", error);
    }
  };

  const onRefresh = () => {
      setRefreshing(true);
      fetchOrders();
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
            <Text style={styles.pageTitle}>Order Management</Text>
            <Text style={styles.subTitle}>Track and manage customer orders</Text>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.textInactive || '#9ca3af'} style={{marginRight: 10}} />
        <TextInput 
            style={styles.searchInput}
            placeholder="Search by Order ID or Customer..."
            value={searchText}
            onChangeText={(t) => handleSearch(t)}
            placeholderTextColor="#9ca3af"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
            data={filteredOrders}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <OrderItem item={item} onUpdateStatus={handleUpdateStatus} />
            )}
            contentContainerStyle={styles.listContainer}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No orders found.</Text>
                </View>
            }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f8f9fa' },
  headerRow: { marginBottom: 24 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subTitle: { fontSize: 14, color: '#6b7280' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#e5e7eb', ...Platform.select({ web: { boxShadow: '0 2px 4px rgba(0,0,0,0.02)' } }) },
  searchInput: { flex: 1, fontSize: 15, color: '#374151', outlineStyle: 'none' },
  listContainer: { paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#9ca3af', fontSize: 16, fontStyle: 'italic' }
});

export default OrdersScreen;