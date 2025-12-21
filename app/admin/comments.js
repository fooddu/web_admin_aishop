import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, View } from 'react-native';
import CommentItem from '../src/components/CommentItem';
import { API_BASE_URL, COLORS } from '../src/constants';

const CommentsScreen = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Comments
  const fetchComments = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/reviews`, { 
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success) setComments(data.data);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchComments(); }, []));

  // 2. Toggle Status
  const handleToggleStatus = async (id, currentStatus) => {
      try {
          const token = await AsyncStorage.getItem('token');
          await fetch(`${API_BASE_URL}/reviews/${id}/status`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ isActive: !currentStatus })
          });
          setComments(prev => prev.map(c => c._id === id ? { ...c, isActive: !currentStatus } : c));
      } catch (e) { console.error(e); }
  };

  // 3. Reply Comment
  const handleReply = async (id, replyText) => {
      try {
          const token = await AsyncStorage.getItem('token');
          await fetch(`${API_BASE_URL}/reviews/${id}/reply`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({ reply: replyText })
          });
          setComments(prev => prev.map(c => c._id === id ? { ...c, reply: replyText } : c));
          if(Platform.OS === 'web') alert("Reply sent!");
      } catch (e) { console.error(e); }
  };

  // 4. Delete Comment
  const handleDelete = async (id) => {
      if (Platform.OS === 'web') {
          if (!window.confirm("Delete this comment?")) return;
      }
      try {
          const token = await AsyncStorage.getItem('token');
          await fetch(`${API_BASE_URL}/reviews/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
          });
          setComments(prev => prev.filter(c => c._id !== id));
      } catch (e) { console.error(e); }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
          <Text style={styles.title}>Review Management</Text>
          <Text style={styles.subtitle}>Moderate customer reviews</Text>
      </View>

      {loading ? <ActivityIndicator size="large" color={COLORS.primary} style={{marginTop: 50}} /> : (
          <FlatList 
            data={comments}
            keyExtractor={item => item._id}
            renderItem={({item}) => (
                <CommentItem 
                    item={item} 
                    onToggleStatus={handleToggleStatus}
                    onReply={handleReply}
                    onDelete={handleDelete}
                />
            )}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyComponent={<Text style={{textAlign: 'center', marginTop: 50, color: '#999'}}>No reviews yet.</Text>}
          />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#f8f9fa' },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 }
});

export default CommentsScreen;