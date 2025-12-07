import { Eye, EyeOff, Pencil } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// Giả định bạn có file constants chứa API_BASE_URL và COLORS
import { API_BASE_URL, COLORS } from '../../constants';

const ProductItemGrid = ({ item, onEdit, onToggleStatus }) => {
  
  const [isHovered, setIsHovered] = useState(false);

  // Format giá tiền (VND)
  const formattedPrice = new Intl.NumberFormat('vi-VN', { 
      style: 'currency', 
      currency: 'VND',
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0,
  }).format(item.price || 0);

  // --- HÀM XỬ LÝ URL ẢNH TỐI ƯU ---
  const getImageUrl = (imageData) => {
    if (!imageData || imageData.length === 0) {
        return 'https://via.placeholder.com/150';
    }
    let imagePath = Array.isArray(imageData) ? imageData[0] : imageData;
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    const SERVER_URL = API_BASE_URL.replace('/api', ''); 
    
    // ⭐ Đảm bảo imagePath có '/uploads' nếu nó là đường dẫn tương đối ⭐
    let finalPath = imagePath.startsWith('/uploads') ? imagePath : `/uploads${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    
    return `${SERVER_URL}${finalPath}`; 
  };
    
  const finalImageUrl = getImageUrl(item.image);

  // Lấy tồn kho
  const realStock = (item.stock !== undefined) ? item.stock : (item.countInStock || 0);

  // Lấy trạng thái isActive
  const isActive = item.isActive !== undefined ? item.isActive : true;

  // ---------------------------------------------------

  return (
    <View 
        style={[
            styles.cardContainer, 
            !isActive && styles.hiddenCardContainer,
            Platform.OS === 'web' && isHovered && styles.cardHover, 
        ]}
        onMouseEnter={() => Platform.OS === 'web' && setIsHovered(true)}
        onMouseLeave={() => Platform.OS === 'web' && setIsHovered(false)}
    >
      <Image 
        source={{ uri: finalImageUrl }} 
        style={styles.image} 
        resizeMode="cover" // Giữ cover để lấp đầy khung hình
      />

      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={2}>{item.name || 'Sản phẩm không tên'}</Text>
        <Text style={styles.price}>{formattedPrice}</Text>

        <View style={styles.detailsRow}>
          <Text style={styles.category} numberOfLines={1}>
            <Text style={{ fontWeight: '600' }}>Loại:</Text> {item.category?.name || item.category || 'Chưa phân loại'}
          </Text>
          <Text style={[styles.stock, realStock === 0 && styles.outOfStock]}>
            <Text style={{ fontWeight: '600' }}>SL:</Text> {realStock}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
            style={[styles.btn, styles.editBtn, styles.flexBtn]} 
            onPress={() => onEdit(item)}
        >
          <Pencil size={18} color="#fff" />
          <Text style={styles.btnText}>Sửa</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.btn, styles.flexBtn, isActive ? styles.hideBtn : styles.showBtn]} 
          onPress={() => onToggleStatus(item._id, !isActive)} 
        >
          {isActive ? <EyeOff size={18} color="#fff" /> : <Eye size={18} color="#fff" />}
          <Text style={styles.btnText}>{isActive ? 'Ẩn' : 'Hiện'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: COLORS.background || '#fff',
    borderRadius: 12,
    margin: 8, 
    flex: 1, 
    overflow: 'hidden', 
    
    // Chia đều 2 cột trên Web, loại bỏ khoảng trống thừa.
    width: Platform.OS === 'web' ? 'calc(50% - 16px)' : undefined, 
    
    minWidth: 160, 
    
    ...Platform.select({
      web: { 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        border: '1px solid #f0f0f0',
        transitionProperty: 'box-shadow, opacity', 
        transitionDuration: '0.3s',
        flexShrink: 0, 
      },
      android: { elevation: 4 },
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, shadowOffset: { width: 0, height: 2 } }
    }),
  },
  cardHover: {
    boxShadow: '0 6px 16px rgba(0,0,0,0.15)', 
    transform: [{ translateY: -2 }], 
    transitionProperty: 'box-shadow, transform',
    transitionDuration: '0.3s',
  },
  hiddenCardContainer: { 
    opacity: 0.6,
    backgroundColor: '#fef3f6', 
    borderWidth: 2,
    borderColor: '#fca5a5', 
  },
  image: {
    width: '100%',
    // ⭐ Tối ưu: Dùng aspectRatio để giữ tỉ lệ 16:9 và tránh bị cắt ảnh khi dùng cover ⭐
    aspectRatio: 16 / 9, 
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  infoContainer: {
    padding: 12,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 5,
    minHeight: 40, 
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary || '#FF4D80',
    marginBottom: 8,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  category: {
    fontSize: 13,
    color: '#666',
    flex: 2, 
    marginRight: 8,
  },
  stock: {
    fontSize: 13,
    fontWeight: '500',
    color: '#444',
    flex: 1,
    textAlign: 'right',
  },
  outOfStock: {
    color: '#ef4444', 
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  btn: {
    flex: 1, 
    height: 44, 
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  flexBtn: {
    gap: 6,
    borderRightWidth: 1, 
    borderRightColor: '#ffffff40' 
  },
  btnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  editBtn: {
    backgroundColor: '#3b82f6', 
    ...Platform.select({ web: { cursor: 'pointer', ':hover': { backgroundColor: '#2563eb' } } }),
  },
  hideBtn: { 
    backgroundColor: '#9ca3af', 
    ...Platform.select({ web: { cursor: 'pointer', ':hover': { backgroundColor: '#6b7280' } } }),
  },
  showBtn: { 
    backgroundColor: '#10b981', 
    borderRightWidth: 0, 
    ...Platform.select({ web: { cursor: 'pointer', ':hover': { backgroundColor: '#059669' } } }),
  }
});

export default ProductItemGrid;