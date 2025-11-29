import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Import Icon
import { CheckCircle, Clock, Package, Truck, XCircle } from 'lucide-react-native';
// Import Constants
import { COLORS } from '../../constants';

const OrderItem = ({ item, onUpdateStatus }) => {
  
  // 🛡️ CHỐT CHẶN: Nếu item rỗng -> Không hiển thị gì cả
  if (!item) return null;

  // 1. Xử lý ngày tháng an toàn
  const formattedDate = item?.createdAt 
    ? new Date(item.createdAt).toLocaleDateString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : '---';

  // 2. Xử lý giá tiền an toàn (Check cả total và totalPrice)
  const displayPrice = item?.total || item?.totalPrice || 0;
  const formattedTotal = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(displayPrice);

  // 3. Cấu hình màu sắc theo trạng thái
  const getStatusConfig = (status) => {
    switch (status) {
      case 'pending': return { color: '#f59e0b', label: 'Chờ xử lý', icon: Clock };      
      case 'processing': return { color: '#3b82f6', label: 'Đang chuẩn bị', icon: Package }; 
      case 'shipped': return { color: '#8b5cf6', label: 'Đang giao', icon: Truck };      
      case 'delivered': return { color: '#10b981', label: 'Đã giao', icon: CheckCircle }; 
      case 'cancelled': return { color: '#ef4444', label: 'Đã hủy', icon: XCircle };     
      default: return { color: '#6b7280', label: status || 'Khác', icon: Clock };
    }
  };

  const statusConfig = getStatusConfig(item?.status || 'pending');
  const StatusIcon = statusConfig.icon;

  return (
    <View style={styles.container}>
      {/* Cột 1: Mã & Khách */}
      <View style={[styles.column, { flex: 2 }]}>
        <Text style={styles.orderId}>#{item?._id?.slice(-6).toUpperCase() || '---'}</Text>
        <Text style={styles.customerName}>{item?.user?.name || 'Khách vãng lai'}</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </View>

      {/* Cột 2: Tiền */}
      <View style={[styles.column, { flex: 1.5 }]}>
        <Text style={styles.totalPrice}>{formattedTotal}</Text>
        <Text style={styles.itemCount}>{item?.products?.length || 0} sản phẩm</Text>
      </View>

      {/* Cột 3: Trạng thái & Nút */}
      <View style={[styles.column, { flex: 2, alignItems: 'flex-end' }]}>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.color + '20' }]}> 
            <StatusIcon size={14} color={statusConfig.color} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
                {statusConfig.label}
            </Text>
        </View>

        {item?.status !== 'delivered' && item?.status !== 'cancelled' && (
             <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => onUpdateStatus(item)}
             >
                <Text style={styles.actionText}>Cập nhật tiếp theo ➜</Text>
             </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      web: { boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #eee' },
      android: { elevation: 2 }
    }),
  },
  column: { justifyContent: 'center' },
  orderId: { fontWeight: 'bold', fontSize: 16, color: COLORS.primary },
  customerName: { fontSize: 14, color: '#333', fontWeight: '500', marginTop: 2 },
  date: { fontSize: 12, color: '#888', marginTop: 2 },
  totalPrice: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  itemCount: { fontSize: 12, color: '#666' },
  statusBadge: {
    flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: 20, alignItems: 'center', marginBottom: 8,
  },
  statusText: { fontSize: 12, fontWeight: '600' },
  actionButton: {
    paddingVertical: 6, paddingHorizontal: 12, backgroundColor: '#f3f4f6',
    borderRadius: 6, borderWidth: 1, borderColor: '#e5e7eb'
  },
  actionText: { fontSize: 12, color: '#333', fontWeight: '500' }
});

export default OrderItem;