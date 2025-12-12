import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import NotificationBell from '../src/components/NotificationBell';
import SideBar from '../src/components/SideBar';

export default function AdminStackLayout() {
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    const getUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserName(user.name || 'Admin');
        }
      } catch (e) {}
    };
    getUser();
  }, []);

  return (
    <View style={styles.container}> 
      {/* 1. SIDEBAR */}
      <SideBar />
      
      {/* 2. KHU VỰC CHÍNH */}
      <View style={styles.contentArea}>
          
          {/* ⭐ HEADER ⭐ */}
          <View style={styles.header}>
              <Text style={styles.welcomeText}>Welcome, {userName} 👋</Text>
              
              <View style={styles.headerRight}>
                  {/* CHUÔNG THÔNG BÁO */}
                  <NotificationBell />
                  
                  {/* Avatar */}
                  <View style={styles.avatarCircle}>
                      <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
                  </View>
              </View>
          </View>

          {/* ⭐ STACK CONTENT ⭐ */}
          <View style={{ flex: 1 }}>
              <Stack 
                screenOptions={{ 
                  headerShown: false, 
                  contentStyle: styles.stackContent 
                }}
              >
                  <Stack.Screen name="index" />
                  <Stack.Screen name="products" />
                  <Stack.Screen name="orders" />
                  <Stack.Screen name="users" />
                  <Stack.Screen name="settings" />
                  <Stack.Screen name="product-form" />
                  <Stack.Screen name="categories" /> 
                  <Stack.Screen name="profile-edit" />
                  <Stack.Screen name="change-password" />
                  <Stack.Screen name="comments" />
              </Stack>
          </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row', 
    backgroundColor: '#f8f9fa', 
    ...Platform.select({
      web: { height: '100vh' },
    }),
  },
  contentArea: {
      flex: 1, 
      display: 'flex',
      flexDirection: 'column', 
      overflow: 'hidden', 
  },
  header: {
      height: 64,
      backgroundColor: '#fff',
      borderBottomWidth: 1,
      borderBottomColor: '#e5e7eb',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 24,
      ...Platform.select({
          web: { zIndex: 10 } 
      })
  },
  welcomeText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#374151'
  },
  headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12
  },
  avatarCircle: {
      width: 36, height: 36,
      borderRadius: 18,
      backgroundColor: '#ec4899', 
      justifyContent: 'center',
      alignItems: 'center'
  },
  avatarText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14
  },
  stackContent: {
      backgroundColor: '#f8f9fa', 
      flex: 1,
  }
});