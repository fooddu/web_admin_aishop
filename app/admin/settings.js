import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

// Import Icons
import {
  Bell,
  ChevronRight,
  Globe,
  Lock, LogOut,
  Mail,
  Shield,
  User
} from 'lucide-react-native';

// Import Constants
import { COLORS } from '../src/constants';

const SettingsScreen = () => {
  const router = useRouter();
  
  // State giả lập dữ liệu user (Sau này lấy từ API/Storage)
  const [userInfo, setUserInfo] = useState({
    name: 'Admin User',
    email: 'admin@shopai.com',
    role: 'Administrator',
    avatar: null // Chưa có ảnh thì dùng icon mặc định
  });

  // State cho các nút gạt (Switch)
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: false,
    darkMode: false,
  });

  // Hàm xử lý Logout
  const handleLogout = async () => {
    // Hỏi xác nhận trước khi thoát
    if (Platform.OS === 'web') {
        const confirm = window.confirm("Bạn có chắc chắn muốn đăng xuất?");
        if (!confirm) return;
    } else {
        // Logic Alert cho mobile (nếu cần)
    }

    try {
      await AsyncStorage.removeItem('token');
      // Chuyển về màn hình login
      router.replace('/admin'); 
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
    }
  };

  // Hàm bật/tắt Switch
  const toggleSwitch = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Component con: Dòng cài đặt (Row)
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
            trackColor={{ false: "#767577", true: COLORS.primary }}
            thumbColor={settings[switchKey] ? "#fff" : "#f4f3f4"}
            onValueChange={() => toggleSwitch(switchKey)}
            value={settings[switchKey]}
          />
        ) : (
          <ChevronRight size={20} color="#ccc" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Cài đặt Hệ thống</Text>
        <Text style={styles.pageSubtitle}>Quản lý tài khoản và cấu hình ứng dụng.</Text>
      </View>

      {/* 1. THẺ HỒ SƠ (PROFILE CARD) */}
      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
           {userInfo.avatar ? (
             <Image source={{ uri: userInfo.avatar }} style={styles.avatarImage} />
           ) : (
             <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>{userInfo.name.charAt(0)}</Text>
             </View>
           )}
        </View>
        <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userInfo.name}</Text>
            <Text style={styles.profileEmail}>{userInfo.email}</Text>
            <View style={styles.roleBadge}>
                <Text style={styles.roleText}>{userInfo.role}</Text>
            </View>
        </View>
        <TouchableOpacity style={styles.editButton} onPress={() => alert("Tính năng cập nhật đang phát triển")}>
            <Text style={styles.editButtonText}>Sửa</Text>
        </TouchableOpacity>
      </View>

      {/* 2. NHÓM CÀI ĐẶT CHUNG */}
      <Text style={styles.sectionHeader}>Cấu hình Chung</Text>
      <View style={styles.sectionContainer}>
        <SettingItem 
          icon={Bell} 
          title="Thông báo đẩy" 
          subtitle="Nhận thông báo khi có đơn hàng mới"
          isSwitch 
          switchKey="pushNotifications" 
        />
        <View style={styles.separator} />
        <SettingItem 
          icon={Mail} 
          title="Thông báo qua Email" 
          isSwitch 
          switchKey="emailNotifications" 
        />
        <View style={styles.separator} />
        <SettingItem 
          icon={Globe} 
          title="Ngôn ngữ" 
          subtitle="Tiếng Việt"
          onPress={() => {}}
        />
      </View>

      {/* 3. NHÓM BẢO MẬT */}
      <Text style={styles.sectionHeader}>Bảo mật & Tài khoản</Text>
      <View style={styles.sectionContainer}>
        <SettingItem 
          icon={User} 
          title="Cập nhật thông tin" 
          onPress={() => {}}
        />
        <View style={styles.separator} />
        <SettingItem 
          icon={Lock} 
          title="Đổi mật khẩu" 
          onPress={() => {}}
        />
        <View style={styles.separator} />
        <SettingItem 
          icon={Shield} 
          title="Quyền hạn truy cập" 
          subtitle="Xem chi tiết quyền Admin"
          onPress={() => {}}
        />
      </View>

      {/* 4. NHÓM NGUY HIỂM (LOGOUT) */}
      <View style={[styles.sectionContainer, { marginTop: 20 }]}>
        <SettingItem 
          icon={LogOut} 
          title="Đăng xuất" 
          isDestructive 
          onPress={handleLogout}
        />
      </View>

      <Text style={styles.versionText}>Phiên bản Admin v1.0.0</Text>

    </ScrollView>
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
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6c757d',
    marginTop: 4,
  },
  // Style cho Profile Card
  profileCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 25,
    // Shadow
    ...Platform.select({
        web: { boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
        android: { elevation: 3 }
    }),
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  profileEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  roleBadge: {
    backgroundColor: '#e0f2fe',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    color: '#0284c7',
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  // Style cho Section Settings
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: '#888',
    marginBottom: 10,
    marginLeft: 5,
    textTransform: 'uppercase',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 25,
    ...Platform.select({
        web: { border: '1px solid #eee' }
    }),
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  destructiveIconBox: {
    backgroundColor: '#fee2e2',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: '#333',
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  destructiveText: {
    color: '#ef4444',
  },
  separator: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 60, // Thụt vào để thẳng hàng với text
  },
  versionText: {
    textAlign: 'center',
    color: '#ccc',
    fontSize: 12,
    marginBottom: 20,
  }
});

export default SettingsScreen;