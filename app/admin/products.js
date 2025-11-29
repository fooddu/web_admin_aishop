import AsyncStorage from '@react-native-async-storage/async-storage';
import { Plus } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
// Import hooks của Expo Router
import { useFocusEffect, useRouter } from 'expo-router';

// Import Component & Constants
import ProductItem from '../src/components/ProductItem';
import { API_BASE_URL, COLORS } from '../src/constants';

const ProductsScreen = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Hàm gọi API lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/products`);
        const data = await response.json();

        if (data.success) {
            setProducts(data.data || []);
        }
    } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  // 2. Tự động load lại danh sách khi màn hình được focus (Quay lại từ trang Form)
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  // 3. Xử lý Xóa sản phẩm
  const handleDelete = async (id) => {
    // Xác nhận xóa
    if (Platform.OS === 'web') {
        const confirm = window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?");
        if (!confirm) return;
    } else {
        // Logic Alert cho mobile có thể thêm ở đây nếu cần, tạm thời chạy thẳng logic xóa
    }

    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Cập nhật lại list local (Optimistic Update)
            setProducts(prev => prev.filter(item => item._id !== id));
            if (Platform.OS === 'web') alert("Đã xóa thành công!");
        } else {
            alert(data.message || "Xóa thất bại");
        }
    } catch (error) {
        console.error("Lỗi xóa:", error);
        alert("Có lỗi xảy ra khi xóa");
    }
  };

  // 4. Chuyển hướng sang trang Thêm Mới
  const handleCreate = () => {
     router.push('/admin/product-form');
  };

  // 5. Chuyển hướng sang trang Sửa (Gửi kèm ID)
  const handleEdit = (item) => {
     console.log("Edit item:", item._id);
     // URL sẽ thành: /admin/product-form?id=xxxx
     router.push({ pathname: '/admin/product-form', params: { id: item._id } });
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
            <Text style={styles.pageTitle}>Quản lý Sản phẩm</Text>
            <Text style={styles.subTitle}>Thêm, sửa, xóa và xem chi tiết sản phẩm.</Text>
        </View>

        {/* Nút Thêm Mới */}
        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
            <Plus size={20} color="#fff" />
            <Text style={styles.addButtonText}>Thêm mới</Text>
        </TouchableOpacity>
      </View>

      {/* DANH SÁCH */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
            data={products}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <ProductItem 
                    item={item} 
                    onEdit={handleEdit}     // <-- Truyền hàm sửa
                    onDelete={handleDelete} // <-- Truyền hàm xóa
                />
            )}
            contentContainerStyle={styles.listContainer}
            // Kéo xuống để refresh thủ công
            onRefresh={() => {
                setRefreshing(true);
                fetchProducts();
            }}
            refreshing={refreshing}
            // Hiển thị khi danh sách trống
            ListEmptyComponent={
                <Text style={styles.emptyText}>Chưa có sản phẩm nào.</Text>
            }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subTitle: {
    fontSize: 14,
    color: COLORS.textInactive,
    marginTop: 4,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    gap: 8,
    // Shadow
    ...Platform.select({
        web: { boxShadow: '0 2px 4px rgba(255, 77, 128, 0.3)' }
    })
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    paddingBottom: 20,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: COLORS.textInactive,
    fontSize: 16,
  }
});

export default ProductsScreen;