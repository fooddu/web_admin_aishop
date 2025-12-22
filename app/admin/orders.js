// File: app/(admin)/orders.js (Admin Order Management Screen)

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useLocalSearchParams } from 'expo-router';
import { ArrowRight, CheckCircle, Clock, Package, Search, SortAsc, SortDesc, Truck, User, XCircle } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Platform,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';


import { io } from 'socket.io-client/dist/socket.io';
const COLORS = { primary: '#E91E63', textInactive: '#9ca3af' };
// ⚠️ THAY THẾ BẰNG API Base URL CỦA BẠN ⚠️
const API_BASE_URL = 'http://localhost:4000/api'; 
// ⚠️ THAY THẾ BẰNG SOCKET SERVER URL CỦA BẠN ⚠️
const SOCKET_SERVER_URL = 'http://localhost:4000'; 


// OrderItem Component (Chỉ chứa logic hiển thị)
const OrderItem = ({ item, onUpdateStatus }) => {
    // ... (logic giữ nguyên)
    const formattedDate = item?.createdAt 
        ? new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', 
            hour: '2-digit', minute: '2-digit'
          })
        : '---';

    const displayPrice = item?.total || item?.totalPrice || 0;
    const formattedTotal = new Intl.NumberFormat('en-US', { 
          style: 'currency', currency: 'USD' 
    }).format(displayPrice);

    const getStatusConfig = (status) => {
        switch (status) {
            case 'pending': 
                return { color: '#f59e0b', label: 'Pending', nextAction: 'Process', icon: Clock, bg: '#fffbeb' };      
            case 'processing': 
                return { color: '#3b82f6', label: 'Processing', nextAction: 'Ship', icon: Package, bg: '#eff6ff' }; 
            case 'shipped': 
                return { color: '#8b5cf6', label: 'Shipped', nextAction: 'Deliver', icon: Truck, bg: '#f5f3ff' };      
            case 'delivered': 
                return { color: '#10b981', label: 'Delivered', nextAction: null, icon: CheckCircle, bg: '#ecfdf5' }; 
            case 'cancelled': 
                return { color: '#ef4444', label: 'Cancelled', nextAction: null, icon: XCircle, bg: '#fef2f2' };     
            default: 
                return { color: '#6b7280', label: status || 'Unknown', nextAction: null, icon: Clock, bg: '#f3f4f6' };
        }
    };

    const statusConfig = getStatusConfig(item?.status || 'pending');
    const StatusIcon = statusConfig.icon;
    const styles = itemStyles; 

    return (
        <View style={styles.card}>
            
            {/* LEFT SIDE: Info */}
            <View style={styles.leftSection}>
                <View style={styles.headerRow}>
                    <Text style={styles.orderId}>#{item?._id?.slice(-6).toUpperCase()}</Text>
                    <Text style={styles.date}>{formattedDate}</Text>
                </View>
                
                <View style={styles.userRow}>
                    <User size={14} color="#6b7280" />
                    <Text style={styles.customerName} numberOfLines={1}>
                        {item?.user?.name || 'Guest Customer'}
                    </Text>
                </View>

                <Text style={styles.itemCount}>
                    {item?.products?.length || 0} item(s)
                </Text>
            </View>

            {/* RIGHT SIDE: Price, Status & Action */}
            <View style={styles.rightSection}>
                <Text style={styles.price}>{formattedTotal}</Text>

                {/* Status Badge */}
                <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <StatusIcon size={12} color={statusConfig.color} style={{ marginRight: 4 }} />
                    <Text style={[styles.statusText, { color: statusConfig.color }]}>
                        {statusConfig.label}
                    </Text>
                </View>

                {/* Action Button (Conditional) */}
                {statusConfig.nextAction && (
                    <TouchableOpacity 
                        style={styles.actionBtn}
                        onPress={() => onUpdateStatus(item)}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.actionText}>Mark as {statusConfig.nextAction}</Text>
                        <ArrowRight size={14} color="#374151" />
                    </TouchableOpacity>
                )}
            </View>

        </View>
    );
};


const OrdersScreen = () => {
    const params = useLocalSearchParams(); 
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // ⭐️ MỚI: Trạng thái sắp xếp (true: DESC/Mới nhất, false: ASC/Cũ nhất) ⭐️
    const [isDescending, setIsDescending] = useState(true); 

    // --- HELPER SORT FUNCTION ---
    const sortOrders = (orderList, descending) => {
        return [...orderList].sort((a, b) => {
            const dateA = new Date(a.createdAt || a.dateOrdered);
            const dateB = new Date(b.createdAt || b.dateOrdered);
            
            if (descending) {
                return dateB - dateA; // Mới nhất trước (DESC)
            } else {
                return dateA - dateB; // Cũ nhất trước (ASC)
            }
        });
    };
    
    // ⭐️ EFFECT: ÁP DỤNG SORT KHI DANH SÁCH CHÍNH HOẶC TRẠNG THÁI THAY ĐỔI ⭐️
    useEffect(() => {
        // Áp dụng sắp xếp cho danh sách filtered
        handleSearch(searchText, orders);
    }, [isDescending, orders, searchText]); 
    
    // --- SOCKET.IO KẾT NỐI VÀ LẮNG NGHE ---
    useEffect(() => {
        let socket;
        
        const connect = async () => {
             const token = await AsyncStorage.getItem('token');
             if (!token) {
                 console.log("Admin token missing, skipping socket connection.");
                 return;
             }
             
             // ⭐️ FIX: Thêm transports: ['websocket'] (thường giúp trong RN/Web) ⭐️
             socket = io(SOCKET_SERVER_URL, {
                 transports: ['websocket'],
                 auth: { token: token } 
             });

             socket.on('connect', () => console.log('Admin Socket Connected'));
             socket.on('disconnect', () => console.log('Admin Socket Disconnected'));
             socket.on('connect_error', (err) => console.error('Socket Connection Error:', err));


             // Lắng nghe Đơn hàng mới (từ User)
             socket.on('newOrder', (newOrder) => {
                 console.log("SOCKET: New order received!", newOrder._id);
                 // Thêm và tự động sắp xếp lại
                 setOrders(prev => sortOrders([newOrder, ...prev], isDescending));
             });

             // Lắng nghe Cập nhật trạng thái (từ Server)
             const handleStatusUpdate = (updatedOrder) => {
                 console.log("SOCKET: Status update received for order:", updatedOrder._id);
                 const updateList = (list) => list.map(order => 
                     order._id === updatedOrder._id ? { ...order, status: updatedOrder.status } : order
                 );
                 // Cập nhật Orders (để kích hoạt useEffect sắp xếp và tìm kiếm)
                 setOrders(prev => updateList(prev));
             };
             socket.on('orderStatusUpdated', handleStatusUpdate);
        };
        
        connect();

        return () => {
            if (socket) {
                socket.off('newOrder');
                socket.off('orderStatusUpdated');
                socket.disconnect();
            }
        };
    }, [isDescending]); // Kết nối lại nếu trạng thái sắp xếp thay đổi
    // ----------------------------------------------------

    // 2. Fetch Orders API
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
                const sortedOrders = sortOrders(data.data || [], isDescending); // Sắp xếp ngay khi fetch
                setOrders(sortedOrders);
                setFilteredOrders(sortedOrders); 
            } else {
                 console.error("Fetch API Error:", data.message);
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
    
    // 3. Tự động tìm kiếm khi có Order ID từ Notification (Giữ nguyên)
    useEffect(() => {
        if (params?.orderId && orders.length > 0) {
            console.log("🔔 Notification mở đơn hàng:", params.orderId);
            setSearchText(params.orderId);
            handleSearch(params.orderId, orders);
        }
    }, [params?.orderId, orders]); 

    // 4. Search Function (Áp dụng sắp xếp sau khi lọc)
    const handleSearch = (text, currentList = orders) => {
        setSearchText(text);
        let listToFilter = currentList;
        
        if (text) {
            listToFilter = currentList.filter(item => {
                const idMatch = item._id.toUpperCase().includes(text.toUpperCase());
                const nameMatch = item.user?.name?.toUpperCase().includes(text.toUpperCase());
                return idMatch || nameMatch;
            });
        }
        
        // ⭐️ Áp dụng sắp xếp sau khi lọc ⭐️
        const sortedList = sortOrders(listToFilter, isDescending);
        setFilteredOrders(sortedList);
    };

    // 5. Update Status Logic (Optimistic Update + REST Call)
    const handleUpdateStatus = async (item) => {
        const statusFlow = { 'pending': 'processing', 'processing': 'shipped', 'shipped': 'delivered' };
        const nextStatus = statusFlow[item.status];
        if (!nextStatus) return; 

        // Xử lý xác nhận (dùng native/web Alert)
        let confirmed = false;
        if (Platform.OS === 'web') {
            confirmed = window.confirm(`Update Order #${item._id.slice(-6)} to "${nextStatus.toUpperCase()}"?`);
        } else {
            await new Promise(resolve => {
                Alert.alert(
                    "Confirm Update", 
                    `Update Order #${item._id.slice(-6).toUpperCase()} to "${nextStatus.toUpperCase()}"?`,
                    [
                        { text: "Cancel", style: "cancel", onPress: () => resolve(false) },
                        { text: "Update", onPress: () => resolve(true) }
                    ]
                );
            }).then(result => confirmed = result);
        }
        
        if (!confirmed) return;

        // Nếu xác nhận, thực hiện cập nhật
        performStatusUpdate(item, nextStatus);
    };

    const performStatusUpdate = async (item, nextStatus) => {
        // Optimistic Update: Cập nhật UI ngay lập tức
        const updateListOptimistic = (list) => list.map(order => 
            order._id === item._id ? { ...order, status: nextStatus } : order
        );
        // Cập nhật Orders để kích hoạt useEffect sort/search
        setOrders(prev => updateListOptimistic(prev));

        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/orders/${item._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ status: nextStatus })
            });
            
            const data = await response.json();
            if (data.success) {
                // Server (backend) sẽ gửi Socket Event 'orderStatusUpdated' cho tất cả client
                console.log(`Status update request for ${item._id} sent successfully. Server expected to emit socket event.`);
            } else {
                // ROLLBACK nếu API báo lỗi
                fetchOrders(); 
                Alert.alert("Server Error", data.message || "Failed to update status on server.");
            }
        } catch (error) {
            // ROLLBACK nếu lỗi mạng
            fetchOrders(); 
            console.error("Update Error:", error);
            Alert.alert("Network Error", "Failed to connect to server. Status update failed.");
        }
    };


    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };
    
    // ⭐️ HÀM TOGGLE SẮP XẾP ⭐️
    const toggleSort = () => {
        setIsDescending(prev => !prev);
    };

    // --- RENDER JSX ---
    const SortIcon = isDescending ? SortDesc : SortAsc;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <View>
                    <Text style={styles.pageTitle}>Order Management</Text>
                    <Text style={styles.subTitle}>Track and manage customer orders</Text>
                </View>
            </View>

            <View style={styles.controlsRow}>
                {/* Search Input */}
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

                {/* Sort Button */}
                <TouchableOpacity style={styles.sortButton} onPress={toggleSort}>
                    <SortIcon size={24} color={'#374151'} />
                    <Text style={styles.sortText}>{isDescending ? 'Newest' : 'Oldest'}</Text>
                </TouchableOpacity>
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

// --- STYLES CỦA ADMIN SCREEN ---
const styles = StyleSheet.create({
    container: { flex: 1, padding: 24, backgroundColor: '#f8f9fa' },
    headerRow: { marginBottom: 20 },
    pageTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 4 },
    subTitle: { fontSize: 14, color: '#6b7280' },
    
    // MỚI: Row chứa Search và Sort
    controlsRow: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 24, 
        gap: 10 
    },
    searchContainer: { 
        flex: 1, // Chiếm phần lớn không gian
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#fff', 
        paddingHorizontal: 16, 
        paddingVertical: 12, 
        borderRadius: 12, 
        borderWidth: 1, 
        borderColor: '#e5e7eb', 
        ...Platform.select({ web: { boxShadow: '0 2px 4px rgba(0,0,0,0.02)' } }) 
    },
    searchInput: { flex: 1, fontSize: 15, color: '#374151', outlineStyle: 'none' },
    
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 12,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1, 
        borderColor: '#e5e7eb',
    },
    sortText: {
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '600',
        color: '#374151'
    },
    
    listContainer: { paddingBottom: 40 },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyText: { color: '#9ca3af', fontSize: 16, fontStyle: 'italic' }
});

// --- STYLES CỦA ORDER ITEM ---
const itemStyles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#f3f4f6',
        ...Platform.select({
            web: { boxShadow: '0 2px 8px rgba(0,0,0,0.04)', transition: 'all 0.2s ease' },
            android: { elevation: 2 }
        }),
    },
    // Left Column
    leftSection: { flex: 1.5, paddingRight: 10 },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
    orderId: { fontSize: 16, fontWeight: '800', color: '#111827' },
    date: { fontSize: 12, color: '#9ca3af' },
    userRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
    customerName: { fontSize: 14, color: '#4b5563', fontWeight: '600' },
    itemCount: { fontSize: 13, color: '#9ca3af' },

    // Right Column
    rightSection: { flex: 1, alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
    price: { fontSize: 18, fontWeight: '800', color: COLORS.primary || '#ec4899' },
    
    statusBadge: {
        flexDirection: 'row', alignItems: 'center',
        paddingVertical: 4, paddingHorizontal: 10,
        borderRadius: 20,
    },
    statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

    // Action Button
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: '#f9fafb',
        paddingVertical: 6, paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1, borderColor: '#e5e7eb',
        marginTop: 4,
        ...Platform.select({ web: { cursor: 'pointer' } })
    },
    actionText: { fontSize: 11, fontWeight: '600', color: '#374151' }
});


export default OrdersScreen;