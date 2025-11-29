import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, RefreshControl, StyleSheet, Text, View } from 'react-native';

// Import
import OrderItem from '../src/components/OrderItem';
import { API_BASE_URL, COLORS } from '../src/constants';

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Hàm gọi API lấy danh sách đơn hàng (Có Debug)
  const fetchOrders = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        console.log("🔍 [DEBUG] Token hiện tại:", token ? "Đã có" : "RỖNG!");
        console.log("🚀 [DEBUG] Đang gọi API:", `${API_BASE_URL}/orders`);

        const response = await fetch(`${API_BASE_URL}/orders`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        console.log("📡 [DEBUG] Response Status:", response.status);
        const data = await response.json();

        if (data.success) {
            console.log(`✅ [DEBUG] Lấy thành công ${data.data?.length} đơn hàng.`);
            // Đảo ngược mảng để đơn mới nhất lên đầu (nếu Backend chưa sort)
            const sortedOrders = data.data ? [...data.data].reverse() : [];
            setOrders(sortedOrders);
        } else {
            console.warn("⚠️ [DEBUG] API trả về lỗi:", data.message);
        }
    } catch (error) {
        console.error("🔥 [DEBUG] Lỗi kết nối:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Hàm xử lý Cập nhật trạng thái
  const handleUpdateStatus = async (item) => {
    const statusFlow = {
        'pending': 'processing',
        'processing': 'shipped',
        'shipped': 'delivered'
    };

    const nextStatus = statusFlow[item.status];
    if (!nextStatus) return; 

    if (Platform.OS === 'web') {
        const confirm = window.confirm(`Cập nhật đơn hàng #${item._id.slice(-6)} sang trạng thái "${nextStatus.toUpperCase()}"?`);
        if (!confirm) return;
    }

    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/orders/${item._id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: nextStatus })
        });
        
        const data = await response.json();

        if (data.success) {
            setOrders(prevOrders => prevOrders.map(order => 
                order._id === item._id ? { ...order, status: nextStatus } : order
            ));
            if (Platform.OS === 'web') alert("Cập nhật thành công!");
        } else {
            alert("Lỗi server: " + data.message);
        }

    } catch (error) {
        console.error("Lỗi cập nhật:", error);
        alert("Có lỗi xảy ra.");
    }
  };

  const onRefresh = () => {
      setRefreshing(true);
      fetchOrders();
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
            <Text style={styles.pageTitle}>Quản lý Đơn hàng</Text>
            <Text style={styles.subTitle}>Theo dõi và cập nhật trạng thái đơn hàng.</Text>
        </View>
      </View>

      {/* Danh sách */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <OrderItem 
                    item={item} 
                    onUpdateStatus={handleUpdateStatus} 
                />
            )}
            contentContainerStyle={styles.listContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Chưa có đơn hàng nào.</Text>
                    {/* Hiển thị gợi ý debug nếu rỗng */}
                    <Text style={{fontSize: 12, color: 'red', marginTop: 10}}>
                        (Kiểm tra Console Log (F12) để xem chi tiết API)
                    </Text>
                </View>
            }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  header: { marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee' },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  subTitle: { fontSize: 14, color: '#6c757d', marginTop: 4 },
  listContainer: { paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#888', fontSize: 16, fontStyle: 'italic' }
});

export default OrdersScreen;