import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { ArrowLeft, Mail, Phone, Save, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert, Platform,
    ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { API_BASE_URL, COLORS } from '../src/constants';

const ProfileEditScreen = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userJson = await AsyncStorage.getItem('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          setUserId(user._id || user.id);
          setFormData({
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || ''
          });
        }
      } catch (e) { console.error(e); }
    };
    loadUser();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Lưu lại thông tin mới
        await AsyncStorage.setItem('user', JSON.stringify(data.data));
        
        if (Platform.OS === 'web') alert("Profile updated successfully!");
        else Alert.alert("Success", "Profile updated successfully!");
        
        router.back();
      } else {
        alert(data.message || "Update failed");
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
        <Text style={styles.title}>Update Profile</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <View style={styles.inputWrapper}>
            <User size={20} color="#999" style={styles.icon} />
            <TextInput 
              style={styles.input} 
              value={formData.name}
              onChangeText={(t) => setFormData({...formData, name: t})}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <View style={[styles.inputWrapper, styles.disabledInput]}>
            <Mail size={20} color="#999" style={styles.icon} />
            <TextInput 
              style={[styles.input, {color: '#888'}]} 
              value={formData.email}
              editable={false} 
            />
          </View>
          <Text style={styles.note}>Email cannot be changed.</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <View style={styles.inputWrapper}>
            <Phone size={20} color="#999" style={styles.icon} />
            <TextInput 
              style={styles.input} 
              value={formData.phone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              onChangeText={(t) => setFormData({...formData, phone: t})}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Save size={20} color="#fff" />
              <Text style={styles.saveText}>Save Changes</Text>
            </>
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
  disabledInput: { backgroundColor: '#f0f0f0', borderColor: '#e0e0e0' },
  note: { fontSize: 12, color: '#999', marginTop: 5, fontStyle: 'italic' },
  saveBtn: { flexDirection: 'row', backgroundColor: COLORS.primary, height: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 10 },
  saveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ProfileEditScreen;