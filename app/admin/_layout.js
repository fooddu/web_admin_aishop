
// app/(admin)/_layout.js (Đặt trong thư mục app/(admin)/)
import { Stack } from 'expo-router';
import React from 'react';

// Cấu hình Stack Navigator cho Admin Group
export default function AdminStackLayout() {
  return (
    <Stack screenOptions={{ 
        headerShown: false, // Ẩn header mặc định để Admin UI tự quản lý
        contentStyle: { backgroundColor: '#f4f7f9' } 
    }}>
        {/* Màn hình Dashboard là màn hình chính của Admin Group */}
        <Stack.Screen name="index" /> 
    </Stack>
  );
}
<<<<<<< HEAD
=======


>>>>>>> ff7c27f401df9bb9d09593896f6d515041c4f035
