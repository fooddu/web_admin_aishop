// app/admin/_layout.js

import { Stack } from 'expo-router';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

// ⭐️ Đã xác định: Component SideBar nằm ở '../../src/components/SideBar'
import SideBar from '../src/components/SideBar';
// Import Header để thêm thanh Header ngang (nếu Sidebar chỉ là thanh menu)
// Import COLORS để dùng trong style

// Cấu hình Layout cho nhóm Admin (bao gồm Sidebar và nội dung Stack)
export default function AdminStackLayout() {
  return (
    // ⭐️ CONTAINER CHÍNH: Thiết lập bố cục ngang
    <View style={styles.container}> 
      
      {/* 1. SIDEBAR CỐ ĐỊNH */}
      <SideBar />
      
      {/* 2. KHU VỰC NỘI DUNG CHÍNH (MAIN CONTENT AREA) */}
      <View style={styles.contentArea}>
          {/* Thanh Header ngang (Nếu cần) */}
          {/* <Header /> */}
          
          <Stack 
            screenOptions={{ 
              headerShown: false, // Ẩn Header mặc định
              contentStyle: styles.stackContent 
            }}
          >
              {/* Định nghĩa các màn hình con */}
              <Stack.Screen name="index" /> // Dashboard
              <Stack.Screen name="products" />
              <Stack.Screen name="orders" />
              <Stack.Screen name="users" />
              <Stack.Screen name="settings" />
              <Stack.Screen name="product-form" />
          </Stack>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', // Hiển thị SideBar và Content cạnh nhau
    // Cố định chiều cao cho Web/Desktop 
    ...Platform.select({
      web: { height: '100vh' },
    }),
  },
  contentArea: {
      flex: 1, // Chiếm hết không gian còn lại bên phải SideBar
      // Nếu bạn không dùng Header component riêng, đây là nơi chứa nội dung Dashboard
      overflow: 'auto', // Cho phép cuộn nội dung chính
  },
  stackContent: {
      backgroundColor: '#f4f7f9', // Màu nền giống trong ảnh
      flex: 1,
      padding: 20, // Padding cho nội dung
  }
});