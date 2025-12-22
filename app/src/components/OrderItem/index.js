import {
  ArrowRight,
  CheckCircle, Clock, Package, Truck,
  User,
  XCircle
} from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Giả định COLORS được import từ ../../constants
// import { COLORS } from '../../constants'; 
const COLORS = { primary: '#E91E63' }; // Dùng tạm cho ví dụ

const OrderItem = ({ item, onUpdateStatus }) => {
    console.log("DEBUG ITEM USER:", item._id, item.user);
    if (!item) return null;

    // 1. Format Date (e.g., Nov 24, 2024)
    const formattedDate = item?.createdAt 
        ? new Date(item.createdAt).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric', 
            hour: '2-digit', minute: '2-digit'
          })
        : '---';

    // 2. Format Price (USD)
    const displayPrice = item?.total || item?.totalPrice || 0;
    const formattedTotal = new Intl.NumberFormat('en-US', { 
        style: 'currency', currency: 'USD' 
    }).format(displayPrice);

    // 3. Status Config (Color & Icon mapping)
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

const styles = StyleSheet.create({
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

export default OrderItem;