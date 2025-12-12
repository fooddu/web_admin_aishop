import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Bell, ChevronRight, Globe, Lock, LogOut, Mail, Shield, User } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View
} from 'react-native';
import { API_BASE_URL, COLORS } from '../src/constants';

const SettingsScreen = () => {
  const router = useRouter();
  
  // State User
  const [userInfo, setUserInfo] = useState(null);
  
  // State Settings
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
  });

  // 1. Load User Data & Settings
  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        try {
          const userJson = await AsyncStorage.getItem('user');
          if (userJson) {
            const user = JSON.parse(userJson);
            setUserInfo(user);
            
            // Nếu DB đã có settings, dùng nó. Nếu chưa, dùng mặc định.
            if (user.settings) {
                setSettings({
                    pushNotifications: user.settings.pushNotifications ?? true,
                    emailNotifications: user.settings.emailNotifications ?? false
                });
            }
          }
        } catch (e) {
          console.error("Load error:", e);
        }
      };
      loadData();
    }, [])
  );

  // 2. Toggle Switch Handler (Gọi API ngay lập tức)
  const toggleSwitch = async (key) => {
    // Optimistic Update: Cập nhật UI trước cho mượt
    const newValue = !settings[key];
    setSettings(prev => ({ ...prev, [key]: newValue }));

    try {
        const token = await AsyncStorage.getItem('token');
        if (!userInfo?._id) return;

        // Chuẩn bị payload
        const updatedSettings = { ...settings, [key]: newValue };

        // Gọi API
        await fetch(`${API_BASE_URL}/users/${userInfo._id}/settings`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ settings: updatedSettings })
        });

        // Cập nhật lại Local Storage để lần sau vào app không bị reset
        const updatedUser = { ...userInfo, settings: updatedSettings };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));

    } catch (error) {
        console.error("Save settings error:", error);
        // Revert UI nếu lỗi
        setSettings(prev => ({ ...prev, [key]: !newValue }));
        alert("Failed to save settings. Check connection.");
    }
  };

  const handleLogout = async () => {
    if (Platform.OS === 'web') {
        if (!window.confirm("Are you sure you want to log out?")) return;
    }
    
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      router.replace('/');
    } catch (error) { console.error(error); }
  };

  // --- SUB COMPONENT: Setting Row ---
  const SettingItem = ({ icon: Icon, title, subtitle, isSwitch, switchKey, onPress, isDestructive }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={isSwitch ? () => toggleSwitch(switchKey) : onPress}
      activeOpacity={isSwitch ? 1 : 0.7}
    >
      <View style={styles.leftSection}>
        <View style={[styles.iconBox, isDestructive && styles.destructiveIconBox]}>
          <Icon size={20} color={isDestructive ? '#ef4444' : COLORS.text} />
        </View>
        <View>
            <Text style={[styles.itemTitle, isDestructive && styles.destructiveText]}>{title}</Text>
            {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.rightSection}>
        {isSwitch ? (
          <Switch
            trackColor={{ false: "#d1d5db", true: COLORS.primary }}
            thumbColor={settings[switchKey] ? "#fff" : "#f4f3f4"}
            onValueChange={() => toggleSwitch(switchKey)}
            value={settings[switchKey]}
          />
        ) : (
          <ChevronRight size={20} color="#9ca3af" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Settings</Text>
        <Text style={styles.pageSubtitle}>Manage your preferences and account</Text>
      </View>

      {/* PROFILE CARD */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
             <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                    {userInfo?.name ? userInfo.name.charAt(0).toUpperCase() : 'A'}
                </Text>
             </View>
        </View>
        <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userInfo?.name || 'Loading...'}</Text>
            <Text style={styles.profileEmail}>{userInfo?.email || '...'}</Text>
            <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{userInfo?.role === 'admin' ? 'Administrator' : 'User'}</Text>
            </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push('/admin/profile-edit')}>
            <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
      </View>

      {/* GENERAL */}
      <Text style={styles.sectionHeader}>General</Text>
      <View style={styles.sectionContainer}>
        {/* Chỉ Admin mới thấy nút Push Notification */}
        {userInfo?.role === 'admin' && (
            <>
                <SettingItem 
                  icon={Bell} 
                  title="Push Notifications" 
                  subtitle="Receive alerts for new orders"
                  isSwitch 
                  switchKey="pushNotifications" 
                />
                <View style={styles.separator} />
            </>
        )}
        
        <SettingItem 
          icon={Mail} 
          title="Email Notifications" 
          isSwitch 
          switchKey="emailNotifications" 
        />
        <View style={styles.separator} />
        <SettingItem 
          icon={Globe} 
          title="Language" 
          subtitle="English (US)"
          onPress={() => {}}
        />
      </View>

      {/* SECURITY */}
      <Text style={styles.sectionHeader}>Security</Text>
      <View style={styles.sectionContainer}>
        <SettingItem 
          icon={User} 
          title="Update Profile" 
          onPress={() => router.push('/admin/profile-edit')}
        />
        <View style={styles.separator} />
        <SettingItem 
          icon={Lock} 
          title="Change Password" 
          onPress={() => router.push('/admin/change-password')}
        />
        <View style={styles.separator} />
        <SettingItem 
          icon={Shield} 
          title="Permissions" 
          subtitle="View admin privileges"
          onPress={() => {}}
        />
      </View>

      {/* LOGOUT */}
      <View style={[styles.sectionContainer, { marginTop: 24 }]}>
        <SettingItem 
          icon={LogOut} 
          title="Log Out" 
          isDestructive 
          onPress={handleLogout}
        />
      </View>

      <Text style={styles.versionText}>Version 1.0.0</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f8f9fa' },
  
  header: { marginBottom: 24 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  pageSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },

  // Profile
  profileCard: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16,
    padding: 20, alignItems: 'center', marginBottom: 32,
    ...Platform.select({ web: { boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }, android: { elevation: 3 } })
  },
  avatarContainer: { marginRight: 16 },
  avatarPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 22, fontWeight: '700' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 18, fontWeight: '700', color: '#111827' },
  profileEmail: { fontSize: 14, color: '#6b7280', marginBottom: 6 },
  roleBadge: { backgroundColor: '#e0f2fe', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  roleText: { color: '#0284c7', fontSize: 12, fontWeight: '600' },
  
  editButton: { paddingVertical: 6, paddingHorizontal: 14, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 20 },
  editButtonText: { fontSize: 13, fontWeight: '600', color: '#374151' },

  // Section
  sectionHeader: { fontSize: 13, fontWeight: '700', color: '#9ca3af', marginBottom: 12, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  sectionContainer: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 24, borderWidth: 1, borderColor: '#f3f4f6' },
  
  settingItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#fff' },
  leftSection: { flexDirection: 'row', alignItems: 'center' },
  iconBox: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  destructiveIconBox: { backgroundColor: '#fef2f2' },
  
  itemTitle: { fontSize: 15, fontWeight: '500', color: '#1f2937' },
  itemSubtitle: { fontSize: 13, color: '#9ca3af', marginTop: 2 },
  destructiveText: { color: '#ef4444', fontWeight: '600' },
  
  separator: { height: 1, backgroundColor: '#f3f4f6', marginLeft: 68 },
  versionText: { textAlign: 'center', color: '#d1d5db', fontSize: 12, marginBottom: 20 }
});

export default SettingsScreen;