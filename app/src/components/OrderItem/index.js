import {
  ArrowRight,
  CheckCircle, 
  ChevronDown,
  Clock, 
  CreditCard,
  MapPin,
  Package, 
  Phone,
  Truck,
  User,
  XCircle
} from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants';

const OrderItem = ({ item, onUpdateStatus }) => {
  const [expanded, setExpanded] = useState(false);
  
  if (!item) return null;

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

  return (
    <View style={styles.container}>
      {/* HEADER - Clickable */}
      <TouchableOpacity 
        style={styles.card}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
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

        <View style={styles.rightSection}>
          <Text style={styles.price}>{formattedTotal}</Text>

          <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
            <StatusIcon size={12} color={statusConfig.color} style={{ marginRight: 4 }} />
            <Text style={[styles.statusText, { color: statusConfig.color }]}>
              {statusConfig.label}
            </Text>
          </View>

          {statusConfig.nextAction && (
            <TouchableOpacity 
              style={styles.actionBtn}
              onPress={(e) => {
                e.stopPropagation();
                onUpdateStatus(item);
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.actionText}>Mark as {statusConfig.nextAction}</Text>
              <ArrowRight size={14} color="#374151" />
            </TouchableOpacity>
          )}
          
          <ChevronDown 
            size={16} 
            color="#9ca3af" 
            style={{
              marginTop: 8,
              transform: [{ rotate: expanded ? '180deg' : '0deg' }]
            }} 
          />
        </View>
      </TouchableOpacity>

      {/* EXPANDED SECTION */}
      {expanded && (
        <View style={styles.expandedSection}>
          {/* Products List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📦 Products Ordered:</Text>
            {item.products && item.products.map((product, index) => (
              <View key={index} style={styles.productRow}>
                {product.product?.image?.[0] && (
                  <Image 
                    source={{ uri: product.product.image[0] }} 
                    style={styles.productImage}
                  />
                )}
                <View style={styles.productInfo}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.product?.name || 'Product'}
                  </Text>
                  <Text style={styles.productDetails}>
                    Qty: {product.quantity} × ${product.product?.price?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                <Text style={styles.productTotal}>
                  ${((product.quantity || 0) * (product.product?.price || 0)).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          {/* Payment & Shipping Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💳 Payment & Delivery:</Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <CreditCard size={14} color="#6b7280" />
                <Text style={styles.infoLabelText}>Payment:</Text>
              </View>
              <Text style={styles.infoValue}>
                {item.paymentMethod === 'STRIPE' ? '💳 Stripe' : '💵 Cash on Delivery'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <MapPin size={14} color="#6b7280" />
                <Text style={styles.infoLabelText}>Address:</Text>
              </View>
              <Text style={[styles.infoValue, { flex: 1 }]} numberOfLines={2}>
                {item.shippingAddress?.fullAddress || 'N/A'}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoLabel}>
                <Phone size={14} color="#6b7280" />
                <Text style={styles.infoLabelText}>Phone:</Text>
              </View>
              <Text style={styles.infoValue}>
                {item.shippingAddress?.phoneNumber || 'N/A'}
              </Text>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    ...Platform.select({
      web: { boxShadow: '0 2px 8px rgba(0,0,0,0.04)', cursor: 'pointer' },
      android: { elevation: 2 }
    }),
  },
  
  leftSection: { flex: 1.5, paddingRight: 10 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6, gap: 8 },
  orderId: { fontSize: 16, fontWeight: '800', color: '#111827' },
  date: { fontSize: 12, color: '#9ca3af' },
  
  userRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  customerName: { fontSize: 14, color: '#4b5563', fontWeight: '600' },
  itemCount: { fontSize: 13, color: '#9ca3af' },

  rightSection: { flex: 1, alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  price: { fontSize: 18, fontWeight: '800', color: COLORS.primary || '#ec4899' },
  
  statusBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 4, paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },

  actionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: '#f9fafb',
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1, borderColor: '#e5e7eb',
    marginTop: 4,
    ...Platform.select({ web: { cursor: 'pointer' } })
  },
  actionText: { fontSize: 11, fontWeight: '600', color: '#374151' },

  // Expanded Section
  expandedSection: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },

  section: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  // Product Row
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },

  productImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f3f4f6',
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },

  productDetails: {
    fontSize: 12,
    color: '#6b7280',
  },

  productTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },

  // Info Rows
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },

  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 100,
  },

  infoLabelText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
  },

  infoValue: {
    fontSize: 13,
    color: '#111827',
    textAlign: 'right',
  },
});

export default OrderItem;
