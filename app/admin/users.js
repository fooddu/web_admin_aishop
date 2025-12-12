import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';

import UserItem from '../src/components/UserItem';
import { API_BASE_URL, COLORS } from '../src/constants';

const UsersScreen = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 1. Fetch Users API
  const fetchUsers = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/users`, {
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });
        const data = await response.json();

        if (data.success) {
            setUsers(data.data || []);
            setFilteredUsers(data.data || []);
        } else {
            console.warn("API Error:", data.message);
        }
    } catch (error) {
        console.error("Connection Error:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  // 2. Search Function
  const handleSearch = (text) => {
      setSearchText(text);
      if (text) {
          const newData = users.filter(item => {
              const nameMatch = item.name.toUpperCase().includes(text.toUpperCase());
              const emailMatch = item.email.toUpperCase().includes(text.toUpperCase());
              return nameMatch || emailMatch;
          });
          setFilteredUsers(newData);
      } else {
          setFilteredUsers(users);
      }
  };

  // 3. Toggle User Status (Block/Unblock)
  const handleToggleStatus = async (id, currentStatus) => {
    // Note: Assuming 'isActive' field exists. If not, you might be using a different field logic.
    // Here we simulate toggling active status.
    const action = currentStatus ? "Block" : "Unblock";
    
    if (Platform.OS === 'web') {
        const confirm = window.confirm(`Are you sure you want to ${action} this user?`);
        if (!confirm) return;
    }

    try {
        const token = await AsyncStorage.getItem('token');
        // Assuming backend supports toggle status API for users
        // If not, you might need to implement: router.put('/:id/status') in backend
        const response = await fetch(`${API_BASE_URL}/users/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ isActive: !currentStatus }) // Toggle status
        });
        
        const data = await response.json();

        if (data.success) {
            // Update local list
            const updateList = (list) => list.map(user => 
                user._id === id ? { ...user, isActive: !currentStatus } : user
            );
            
            setUsers(prev => updateList(prev));
            setFilteredUsers(prev => updateList(prev));

            if (Platform.OS === 'web') alert(`User ${action}ed successfully!`);
        } else {
            alert("Error: " + data.message);
        }

    } catch (error) {
        console.error("Status Update Error:", error);
        alert("An error occurred.");
    }
  };

  const onRefresh = () => {
      setRefreshing(true);
      fetchUsers();
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.header}>
        <View>
            <Text style={styles.pageTitle}>User Management</Text>
            <Text style={styles.subTitle}>Manage customers and administrators</Text>
        </View>
        <View style={styles.countBadge}>
            <Text style={styles.countText}>{filteredUsers.length} Users</Text>
        </View>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.textInactive || '#9ca3af'} style={{marginRight: 10}} />
        <TextInput 
            style={styles.searchInput}
            placeholder="Search by Name or Email..."
            value={searchText}
            onChangeText={handleSearch}
            placeholderTextColor="#9ca3af"
        />
      </View>

      {/* LIST */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <UserItem 
                    item={item} 
                    onToggleStatus={handleToggleStatus} 
                />
            )}
            contentContainerStyle={styles.listContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No users found.</Text>
                </View>
            }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f8f9fa' },
  
  header: {
    marginBottom: 24,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'
  },
  pageTitle: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 4 },
  subTitle: { fontSize: 14, color: '#6b7280' },
  
  countBadge: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 20,
  },
  countText: { fontWeight: '700', color: '#374151', fontSize: 12 },

  // Search
  searchContainer: {
      flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
      paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, marginBottom: 24,
      borderWidth: 1, borderColor: '#e5e7eb',
      ...Platform.select({ web: { boxShadow: '0 2px 4px rgba(0,0,0,0.02)' } })
  },
  searchInput: { flex: 1, fontSize: 15, color: '#374151', outlineStyle: 'none' },

  listContainer: { paddingBottom: 40 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#9ca3af', fontSize: 16, fontStyle: 'italic' }
});

export default UsersScreen;