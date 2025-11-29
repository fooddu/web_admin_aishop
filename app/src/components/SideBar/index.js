// src/components/SideBar/index.js
import { Link, useSegments } from 'expo-router';
import React from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
// Đảm bảo import StyleSheet để dùng hàm flatten
import { COLORS, LOGOUT_ITEM, MENU_ITEMS } from '../../constants';

// --- Component nhỏ: SideBarItem ---
const SideBarItem = ({ item }) => {
  const segments = useSegments();
  const currentPath = '/' + segments.join('/');
  
  // Kiểm tra path active
  const isActive = currentPath === item.path;
  const Icon = item.icon;

  return (
    <Link href={item.path} asChild>
      <Pressable 
        // --- SỬA LỖI TẠI ĐÂY ---
        // Dùng StyleSheet.flatten để gộp mảng style thành 1 object duy nhất
        // Điều này giúp React Native Web không bị lỗi "Indexed property" trên thẻ <a>
        style={StyleSheet.flatten([
          styles.itemContainer, 
          isActive && styles.itemActive
        ])}
      >
        {/* Icon */}
        <Icon 
            size={20} 
            color={isActive ? COLORS.background : COLORS.textInactive} 
            strokeWidth={2.5} 
        />
        
        {/* Tên */}
        {/* Text style mảng thì RN Web thường tự xử lý được, nhưng flatten cho chắc chắn cũng tốt */}
        <Text style={StyleSheet.flatten([
            styles.itemText, 
            isActive ? styles.textActive : styles.textInactive
        ])}>
          {item.name}
        </Text>
      </Pressable>
    </Link>
  );
};

// --- Component Chính: SideBar ---
const SideBar = () => {
  return (
    <View style={styles.sidebar}>
      
      {/* 1. Logo/Tên dự án */}
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>AL-SHOP ADMIN</Text>
      </View>

      {/* 2. Menu Items */}
      <View style={styles.menuContainer}>
        {MENU_ITEMS.map((item) => (
          <SideBarItem key={item.name} item={item} />
        ))}
      </View>
      
      {/* 3. Logout Item */}
      <View style={styles.logoutContainer}>
         <SideBarItem item={LOGOUT_ITEM} />
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    ...Platform.select({
        web: {
            width: 240,
            height: '100vh',
            borderRightWidth: 1,
            borderRightColor: '#eee',
            // position: 'fixed', // Nếu cần sidebar đứng yên khi scroll nội dung
            // left: 0,
            // top: 0,
        },
    }),
    backgroundColor: COLORS.background,
    paddingTop: 30,
    paddingHorizontal: 15,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  logoContainer: {
    paddingVertical: 20,
    marginBottom: 20,
    alignItems: 'center', // Căn giữa logo cho đẹp
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  menuContainer: {
    flex: 1,
  },
  logoutContainer: {
      paddingBottom: 40,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginVertical: 4,
    // Không set backgroundColor ở đây để tránh đè style active, mặc định là trong suốt
  },
  itemActive: {
    backgroundColor: COLORS.primary,
  },
  itemText: {
    fontSize: 15,
    marginLeft: 10,
    fontWeight: '500',
  },
  textActive: {
    color: COLORS.background,
  },
  textInactive: {
    color: COLORS.textInactive,
  }
});

export default SideBar;