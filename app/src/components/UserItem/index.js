import { Shield, Trash2, User } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants';

const UserItem = ({ item, onDelete }) => {
  // Phòng thủ dữ liệu
  if (!item) return null;

  // Check xem là Admin hay User thường
  const isAdmin = item.isAdmin || item.role === 'admin';

  return (
    <View style={styles.container}>
      {/* 1. Avatar & Tên */}
      <View style={styles.leftSection}>
        {/* Avatar giả lập bằng chữ cái đầu */}
        <View style={[styles.avatar, { backgroundColor: isAdmin ? COLORS.primary : '#ccc' }]}>
            <Text style={styles.avatarText}>
                {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
            </Text>
        </View>
        <View>
            <Text style={styles.name}>{item.name || 'Người dùng ẩn danh'}</Text>
            <Text style={styles.email}>{item.email}</Text>
        </View>
      </View>

      {/* 2. Vai trò (Badge) */}
      <View style={styles.roleContainer}>
        {isAdmin ? (
            <View style={[styles.badge, styles.badgeAdmin]}>
                <Shield size={12} color="#fff" />
                <Text style={styles.badgeTextAdmin}>Admin</Text>
            </View>
        ) : (
            <View style={[styles.badge, styles.badgeUser]}>
                <User size={12} color="#666" />
                <Text style={styles.badgeTextUser}>User</Text>
            </View>
        )}
      </View>

      {/* 3. Nút Xóa */}
      <TouchableOpacity 
        style={styles.deleteButton} 
        onPress={() => onDelete(item._id)}
      >
        <Trash2 size={18} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      web: { boxShadow: '0 2px 5px rgba(0,0,0,0.05)', border: '1px solid #eee' },
      android: { elevation: 2 }
    }),
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  name: {
    fontWeight: '600',
    fontSize: 15,
    color: '#333',
  },
  email: {
    fontSize: 13,
    color: '#888',
  },
  roleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    alignItems: 'center',
    gap: 4
  },
  badgeAdmin: {
    backgroundColor: COLORS.primary,
  },
  badgeTextAdmin: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  badgeUser: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  badgeTextUser: {
    color: '#666',
    fontSize: 11,
    fontWeight: '600',
  },
  deleteButton: {
    padding: 8,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  }
});

export default UserItem;