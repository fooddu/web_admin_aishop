// app/admin/_layout.js
import { Stack } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native'; // Đã thêm Platform
// ĐÃ SỬA: Đường dẫn import chỉ là ../../src/...
import AdminHeader from '../src/components/Header';
import SideBar from '../src/components/SideBar';

const AdminLayout = () => {
  return (
    <View style={styles.container}>
      
      {/* 1. THANH MENU BÊN TRÁI (SIDEBAR) */}
      <SideBar />
      
      {/* 2. KHU VỰC NỘI DUNG CHÍNH */}
      <View style={styles.mainContent}>
        
        {/* Header trên cùng bên phải */}
        <AdminHeader /> 
        
        {/* Nội dung của các màn hình con */}
        <View style={styles.screenContainer}>
            <Stack
                screenOptions={{
                    headerShown: false,
                    animation: 'slide_from_right' 
                }}
            />
        </View>
        
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    // Style dành riêng cho Web
    ...(Platform.OS === 'web' && { height: '100vh' }), 
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#f8f9fa',
  },
  screenContainer: {
    flex: 1,
    padding: 20,
    overflow: 'auto',
  }
});

export default AdminLayout;