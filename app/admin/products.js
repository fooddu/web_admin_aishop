import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
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

import ProductItem from '../src/components/ProductItem';
import { API_BASE_URL, COLORS } from '../src/constants';

const ProductsScreen = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ⭐ Định nghĩa số cột cố định để sử dụng làm key (khắc phục lỗi FlatList) ⭐
  const columns = Platform.OS === 'web' ? 2 : 1; 

  // 1. Hàm gọi API lấy danh sách sản phẩm
  const fetchProducts = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/products`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
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

  // 2. Tự động load lại danh sách khi màn hình được focus
  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  // 3. Xử lý Tắt/Mở sản phẩm
  const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus ? "hiển thị" : "ẩn";
        
        if (Platform.OS === 'web') {
            const confirm = window.confirm(`Bạn có chắc chắn muốn ${action} sản phẩm này?`);
            if (!confirm) return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/products/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ isActive: currentStatus }) // Gửi trạng thái mới
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Cập nhật lại list local
                setProducts(prev => prev.map(item => 
                    item._id === id ? { ...item, isActive: currentStatus } : item
                ));
                if (Platform.OS === 'web') alert(`Đã ${action} thành công!`);
            } else {
                alert(data.message || `${action} thất bại`);
            }
        } catch (error) {
            console.error(`Lỗi ${action}:`, error);
            alert(`Có lỗi xảy ra khi ${action}`);
        }
    };


  // 4. Chuyển hướng sang trang Thêm Mới 
  const handleCreate = () => {
     router.push('/admin/product-form');
  };

  // 5. Chuyển hướng sang trang Sửa 
  const handleEdit = (item) => {
     console.log("Edit item:", item._id);
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
                    onEdit={handleEdit}     
                    onToggleStatus={handleToggleStatus}                 />
            )}
            // 🔑 KHẮC PHỤC LỖI: Sử dụng columns làm key để buộc re-render khi khởi tạo
            key={columns} 
            numColumns={columns} 
            contentContainerStyle={styles.listContainer}
            onRefresh={() => {
                setRefreshing(true);
                fetchProducts();
            }}
            refreshing={refreshing}
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
    // Cần thêm style này để đảm bảo flex-wrap hoạt động trên Web
    ...Platform.select({
      web: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start', // Căn chỉnh các item về bên trái
      }
    })
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: COLORS.textInactive,
    fontSize: 16,
  }
});

export default ProductsScreen;