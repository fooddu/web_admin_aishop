import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Bell, Info, MessageSquare, Package } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
// ⭐️ IMPORT SOCKET.IO CLIENT ⭐️
import { io } from 'socket.io-client/dist/socket.io';

// Giả định COLORS và API_BASE_URL đã được định nghĩa trong constants
const COLORS = { primary: '#E91E63' }; 
const API_BASE_URL = 'http://localhost:4000/api'; 
// ⚠️ THAY THẾ BẰNG SOCKET SERVER URL CỦA BẠN ⚠️
const SOCKET_SERVER_URL = 'http://localhost:4000'; 


const NotificationBell = () => {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showDropdown, setShowDropdown] = useState(false);

    // --- API: Lấy thông báo (Đã có logic đếm) ---
    const fetchNotifications = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`${API_BASE_URL}/notifications`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setNotifications(data.data);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error("Noti Fetch Error:", error);
        }
    };

    // --- XỬ LÝ KHI BẤM VÀO ITEM ---
    const handleRead = async (item) => {
        // 1. Cập nhật UI (Đã đọc)
        if (!item.isRead) {
            setUnreadCount(prev => Math.max(0, prev - 1));
            setNotifications(prev => prev.map(n => n._id === item._id ? { ...n, isRead: true } : n));
            
            try {
                const token = await AsyncStorage.getItem('token');
                await fetch(`${API_BASE_URL}/notifications/${item._id}/read`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
            } catch (e) {}
        }

        setShowDropdown(false);

        // 2. TÌM ID ĐÍCH
        const targetId = item.referenceId || item.orderId || item.productId || (item.data && item.data.id);
        
        // 3. ĐIỀU HƯỚNG (ĐÃ FIX: Thêm ORDER_STATUS và NEW_REVIEW/NEW_COMMENT)
        if (item.type === 'NEW_ORDER' || item.type === 'ORDER_UPDATE' || item.type === 'ORDER_STATUS') {
            if (targetId) {
                router.push({
                    pathname: '/admin/orders',
                    params: { orderId: targetId } 
                });
            } else {
                router.push('/admin/orders');
            }
        } 
        else if (item.type === 'NEW_COMMENT' || item.type === 'NEW_REVIEW') {
            if (targetId) {
                // Giả định /admin/reviews hoặc /admin/products?reviewId=... để điều hướng đến nơi quản lý review
                router.push({
                    pathname: '/admin/reviews', 
                    params: { reviewId: targetId }
                });
            } else {
                router.push('/admin/products');
            }
        }
    };

    const handleReadAll = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        setUnreadCount(0);
        try {
            const token = await AsyncStorage.getItem('token');
            await fetch(`${API_BASE_URL}/notifications/read-all`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
        } catch (e) {}
    };

    // --- LOGIC SOCKET.IO (Cập nhật Real-Time) ---
    useEffect(() => {
        // Tải thông báo lần đầu và thiết lập interval fetch thông thường
        fetchNotifications();
        const fetchInterval = setInterval(fetchNotifications, 30000);
        
        let socket;
        
        const connectSocket = async () => {
            const token = await AsyncStorage.getItem('token');
            if (!token) return;

            socket = io(SOCKET_SERVER_URL, {
                transports: ['websocket'],
                auth: { token: token } // Xác thực Admin
            });
            
            socket.on('connect', () => console.log('Noti Bell Socket Connected'));
            socket.on('disconnect', () => console.log('Noti Bell Socket Disconnected'));

            // ⭐️ LẮNG NGHE SỰ KIỆN TỪ USER ⭐️
            const handleRealTimeUpdate = (data) => {
                console.log("SOCKET: New notification received in bell.", data);
                // Sau khi nhận sự kiện Socket, gọi API fetchNotifications để tải dữ liệu chi tiết
                // và cập nhật danh sách/badge count một cách chính xác.
                fetchNotifications(); 
            };

            // Lắng nghe các sự kiện cần cập nhật chuông
            socket.on('newOrder', handleRealTimeUpdate);
            socket.on('orderStatusUpdated', handleRealTimeUpdate);
            socket.on('newComment', handleRealTimeUpdate); 
            socket.on('newReview', handleRealTimeUpdate); // Giả định Server cũng phát sự kiện này

        };
        
        connectSocket();

        return () => {
            clearInterval(fetchInterval);
            if (socket) {
                socket.off('newOrder');
                socket.off('orderStatusUpdated');
                socket.off('newComment');
                socket.off('newReview');
                socket.disconnect();
            }
        };
    }, []); // Chỉ chạy một lần khi mount

    const getIcon = (type) => {
        switch(type) {
            case 'NEW_ORDER': 
            case 'ORDER_STATUS':
                return <Package size={18} color={COLORS.primary} />;
            case 'NEW_COMMENT': 
            case 'NEW_REVIEW':
                return <MessageSquare size={18} color="#3b82f6" />;
            default: return <Info size={18} color="#6b7280" />;
        }
    };

    return (
        <View style={{ zIndex: 1000 }}>
            <TouchableOpacity 
                style={styles.bellButton} 
                onPress={() => {
                    setShowDropdown(!showDropdown);
                    if (!showDropdown) fetchNotifications();
                }}
            >
                <Bell size={24} color="#374151" />
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {showDropdown && (
                <Modal transparent animationType="fade" onRequestClose={() => setShowDropdown(false)}>
                    <TouchableWithoutFeedback onPress={() => setShowDropdown(false)}>
                        <View style={styles.modalOverlay}>
                            <TouchableWithoutFeedback>
                                <View style={styles.dropdown}>
                                    <View style={styles.dropdownHeader}>
                                        <Text style={styles.dropdownTitle}>Notifications</Text>
                                        <TouchableOpacity onPress={handleReadAll}>
                                            <Text style={styles.markAllText}>Mark all as read</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <FlatList
                                        data={notifications}
                                        keyExtractor={item => item._id}
                                        style={{ maxHeight: 350 }}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity 
                                                style={[styles.item, !item.isRead && styles.itemUnread]}
                                                onPress={() => handleRead(item)}
                                            >
                                                <View style={styles.iconContainer}>
                                                    {item.image ? (
                                                        <Image source={{uri: item.image}} style={styles.itemImage} />
                                                    ) : (
                                                        <View style={styles.iconPlaceholder}>{getIcon(item.type)}</View>
                                                    )}
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text style={[styles.itemTitle, !item.isRead && {fontWeight: '700'}]}>
                                                        {item.title}
                                                    </Text>
                                                    <Text style={styles.itemDesc} numberOfLines={2}>
                                                        {item.description}
                                                    </Text>
                                                    <Text style={styles.itemTime}>
                                                        {new Date(item.createdAt).toLocaleDateString('en-US')}
                                                    </Text>
                                                </View>
                                                {!item.isRead && <View style={styles.blueDot} />}
                                            </TouchableOpacity>
                                        )}
                                        ListEmptyComponent={
                                            <View style={{ padding: 20, alignItems: 'center' }}>
                                                <Text style={{ color: '#999' }}>No notifications yet</Text>
                                            </View>
                                        }
                                    />
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                    </TouchableWithoutFeedback>
                </Modal>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    bellButton: { padding: 8, position: 'relative', marginRight: 15, ...Platform.select({ web: { cursor: 'pointer' } }) },
    badge: { position: 'absolute', top: 4, right: 4, backgroundColor: '#ef4444', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#fff' },
    badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'transparent' },
    dropdown: { position: 'absolute', top: 60, right: 20, width: 320, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden', ...Platform.select({ web: { boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }, android: { elevation: 10 }, ios: { shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 10 } }) },
    dropdownHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', backgroundColor: '#fff' },
    dropdownTitle: { fontWeight: 'bold', fontSize: 16 },
    markAllText: { color: COLORS.primary, fontSize: 12, fontWeight: '600' },
    item: { flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f9fafb', alignItems: 'flex-start', backgroundColor: '#fff' },
    itemUnread: { backgroundColor: '#fdf2f8' },
    iconContainer: { marginRight: 12, marginTop: 2 },
    iconPlaceholder: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' },
    itemImage: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#eee' },
    itemTitle: { fontSize: 14, color: '#1f2937', marginBottom: 2 },
    itemDesc: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
    itemTime: { fontSize: 10, color: '#9ca3af' },
    blueDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, marginTop: 6, marginLeft: 6 }
});

export default NotificationBell;