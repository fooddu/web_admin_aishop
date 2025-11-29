import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, RefreshControl, StyleSheet, Text, View } from 'react-native';

// Import Component & Constants
import UserItem from '../src/components/UserItem';
import { API_BASE_URL, COLORS } from '../src/constants';

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Gọi API lấy danh sách User
  const fetchUsers = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        console.log("🚀 [DEBUG] Đang lấy danh sách Users...");

        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });
        const data = await response.json();

        if (data.success) {
            setUsers(data.data || []);
            console.log(`✅ [DEBUG] Tìm thấy ${data.data.length} người dùng.`);
        } else {
            console.warn("⚠️ [DEBUG] Lỗi API:", data.message);
        }
    } catch (error) {
        console.error("🔥 [DEBUG] Lỗi kết nối:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. Hàm Xóa User
  const handleDelete = async (id) => {
    if (Platform.OS === 'web') {
        const confirm = window.confirm("Bạn có chắc chắn muốn xóa người dùng này? Hành động này không thể hoàn tác.");
        if (!confirm) return;
    } else {
        // Logic cho Mobile (Alert)
        // ...
    }

    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users/${id}`, {
            method: 'DELETE',
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });
        
        const data = await response.json();

        if (data.success) {
            // Cập nhật list local (Xóa user khỏi mảng state)
            setUsers(prev => prev.filter(user => user._id !== id));
            if (Platform.OS === 'web') alert("Đã xóa thành công!");
        } else {
            alert("Không thể xóa: " + data.message);
        }

    } catch (error) {
        console.error("Lỗi xóa user:", error);
        alert("Có lỗi xảy ra.");
    }
  };

  const onRefresh = () => {
      setRefreshing(true);
      fetchUsers();
  };

  return (
    <View style={styles.container}>
      
      {/* Header */}
      <View style={styles.header}>
        <View>
            <Text style={styles.pageTitle}>Quản lý Người dùng</Text>
            <Text style={styles.subTitle}>Danh sách khách hàng và quản trị viên.</Text>
        </View>
        <View style={styles.countBadge}>
            <Text style={styles.countText}>{users.length} Users</Text>
        </View>
      </View>

      {/* Danh sách */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
            data={users}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <UserItem 
                    item={item} 
                    onDelete={handleDelete} 
                />
            )}
            contentContainerStyle={styles.listContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
                <Text style={styles.emptyText}>Chưa có người dùng nào.</Text>
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
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  subTitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  countBadge: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  countText: {
    fontWeight: 'bold',
    color: '#495057'
  },
  listContainer: {
    paddingBottom: 40,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#888',
    fontSize: 16,
    fontStyle: 'italic'
  }
});

export default UsersScreen;