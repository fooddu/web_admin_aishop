// src/components/Header/index.js (Đặt tên file này là Header)
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
// Giả sử dùng Icon từ @expo/vector-icons
import { Bell, ShoppingCart } from 'lucide-react-native';
import { COLORS } from '../../constants';

const Header = () => {
  return (
    <View style={styles.header}>
      
      {/* Left (Có thể để trống hoặc cho thanh search nếu cần) */}
      <View style={styles.leftContainer}>
        {/* Dashboard Title sẽ do màn hình con tự xử lý */}
      </View>
      
      {/* Right - Thông tin User và Icons */}
      <View style={styles.rightContainer}>
        
        {/* Icons */}
        <ShoppingCart size={20} color={COLORS.textInactive} style={styles.icon} />
        <Bell size={20} color={COLORS.textInactive} style={styles.icon} />
        
        {/* Avatar/Badge User */}
        <View style={styles.adminBadge}>
            <Text style={styles.badgeText}>AD</Text>
        </View>
        <Text style={styles.userName}>Admin User</Text>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Đẩy nội dung sang phải
    alignItems: 'center',
    height: 60, // Chiều cao Header cố định
    backgroundColor: COLORS.background, // Màu trắng
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  leftContainer: {
      flex: 1, // Để chiếm không gian còn lại
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginHorizontal: 10,
  },
  adminBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary, // Màu hồng cho badge
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  badgeText: {
    color: COLORS.background,
    fontWeight: 'bold',
    fontSize: 12,
  },
  userName: {
    marginLeft: 8,
    fontSize: 14,
    color: COLORS.text,
  },
});

export default Header;