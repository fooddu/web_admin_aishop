import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ArrowLeft, Check, Lock } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, Platform,
    ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { API_BASE_URL, COLORS } from '../src/constants';

const ChangePasswordScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    const loadUser = async () => {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
            const user = JSON.parse(userJson);
            setUserId(user._id || user.id);
        }
    };
    loadUser();
  }, []);

  const handleSubmit = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      alert("New password and confirmation do not match!");
      return;
    }
    if (passwords.newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      // Gọi API update user, gửi password mới
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          password: passwords.newPassword
        })
      });

      const data = await response.json();

      if (data.success) {
        if (Platform.OS === 'web') alert("Password changed! Please login again.");
        else Alert.alert("Success", "Password changed! Please login again.");
        
        await AsyncStorage.multiRemove(['token', 'user']);
        router.replace('/');
      } else {
        alert(data.message || "Failed to change password");
      }
    } catch (error) {
      alert("Connection Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>New Password</Text>
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#999" style={styles.icon} />
            <TextInput 
              style={styles.input} 
              secureTextEntry
              value={passwords.newPassword}
              onChangeText={(t) => setPasswords({...passwords, newPassword: t})}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirm New Password</Text>
          <View style={styles.inputWrapper}>
            <Check size={20} color="#999" style={styles.icon} />
            <TextInput 
              style={styles.input} 
              secureTextEntry
              value={passwords.confirmPassword}
              onChangeText={(t) => setPasswords({...passwords, confirmPassword: t})}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <Text style={styles.submitText}>Update Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  backBtn: { marginRight: 15 },
  title: { fontSize: 20, fontWeight: 'bold' },
  content: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, paddingHorizontal: 10, height: 50 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16, outlineStyle: 'none' },
  submitBtn: { backgroundColor: COLORS.primary, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ChangePasswordScreen;