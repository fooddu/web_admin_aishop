import { Pencil, Trash2 } from 'lucide-react-native';
import React from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_BASE_URL, COLORS } from '../../constants';

const ProductItem = ({ item, onEdit, onDelete }) => {
  // Format giá tiền
  const formattedPrice = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price);

  // --- HÀM XỬ LÝ URL ẢNH ---
  const getImageUrl = (imageData) => {
    if (!imageData || imageData.length === 0) {
        return 'https://via.placeholder.com/150';
    }
    let imagePath = Array.isArray(imageData) ? imageData[0] : imageData;
    if (imagePath.startsWith('http')) {
        return imagePath;
    }
    const SERVER_URL = API_BASE_URL.replace('/api', ''); 
    return `${SERVER_URL}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // 🛡️ [FIX LỖI HẾT HÀNG TẠI ĐÂY] 
  // Database trả về 'stock', còn Form gửi lên là 'countInStock'
  // Ta ưu tiên lấy 'stock' trước, nếu không có mới tìm 'countInStock'
  const realStock = (item.stock !== undefined) ? item.stock : (item.countInStock || 0);

  return (
    <View style={styles.container}>
      {/* 1. Ảnh sản phẩm */}
      <Image 
        source={{ uri: getImageUrl(item.image) }} 
        style={styles.image} 
        resizeMode="cover"
      />

      {/* 2. Thông tin chính */}
      <View style={styles.infoContainer}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.category}>{item.category?.name || item.category || 'Chưa phân loại'}</Text>
        <Text style={styles.price}>{formattedPrice}</Text>
        
        {/* Hiển thị tồn kho dựa trên biến realStock đã fix */}
        <Text style={[styles.stock, { color: realStock > 0 ? 'green' : '#ff4d4f' }]}>
            {realStock > 0 ? `Sẵn hàng: ${realStock}` : 'Hết hàng'}
        </Text>
      </View>

      {/* 3. Nút hành động */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.btn, styles.editBtn]} onPress={() => onEdit(item)}>
           <Pencil size={18} color="#fff" />
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.btn, styles.deleteBtn]} onPress={() => onDelete(item._id)}>
           <Trash2 size={18} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.background || '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    ...Platform.select({
      web: { 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          border: '1px solid #f0f0f0' 
      },
      android: { elevation: 3 },
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 }
    }),
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5', 
    borderWidth: 1,
    borderColor: '#eee'
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
    height: 80, 
    justifyContent: 'space-between',
    paddingVertical: 2
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  category: {
    fontSize: 12,
    color: '#888',
  },
  price: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.primary || '#FF4D80',
  },
  stock: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8, 
  },
  btn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#3b82f6', 
  },
  deleteBtn: {
    backgroundColor: '#ef4444', 
  }
});

export default ProductItem;