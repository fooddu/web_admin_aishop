import { Lock, Mail, Phone, Shield, Unlock } from 'lucide-react-native';
import React from 'react';
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { COLORS } from '../../constants';

const UserItem = ({ item, onToggleStatus }) => {
  if (!item) return null;

  const isAdmin = item.role === 'admin';
  const isActive = item.isActive !== undefined ? item.isActive : true; // Default true if field missing

  return (
    <View style={[styles.card, !isActive && styles.cardBlocked]}>
      
      {/* Left: Avatar & Info */}
      <View style={styles.leftSection}>
        {/* Simple Avatar Placeholder */}
        <View style={[styles.avatar, isAdmin ? styles.avatarAdmin : styles.avatarUser]}>
            <Text style={[styles.avatarText, isAdmin ? styles.textAdmin : styles.textUser]}>
                {item.name ? item.name.charAt(0).toUpperCase() : 'U'}
            </Text>
        </View>

        <View>
            <View style={styles.nameRow}>
                <Text style={styles.name}>{item.name || 'Unknown User'}</Text>
                {isAdmin && (
                    <View style={styles.adminBadge}>
                        <Shield size={10} color="#fff" fill="#fff" />
                        <Text style={styles.adminText}>ADMIN</Text>
                    </View>
                )}
            </View>
            
            <View style={styles.infoRow}>
                <Mail size={12} color="#9ca3af" />
                <Text style={styles.infoText}>{item.email}</Text>
            </View>
            {item.phone && (
                <View style={styles.infoRow}>
                    <Phone size={12} color="#9ca3af" />
                    <Text style={styles.infoText}>{item.phone}</Text>
                </View>
            )}
        </View>
      </View>

      {/* Right: Action Button */}
      {/* Prevent blocking yourself logic can be handled here if you pass currentUserID */}
      <TouchableOpacity 
        style={[styles.actionBtn, isActive ? styles.btnBlock : styles.btnUnblock]}
        onPress={() => onToggleStatus(item._id, isActive)}
        activeOpacity={0.7}
      >
        {isActive ? <Lock size={14} color="#ef4444" /> : <Unlock size={14} color="#10b981" />}
        <Text style={[styles.btnText, { color: isActive ? '#ef4444' : '#10b981' }]}>
            {isActive ? 'Block' : 'Unblock'}
        </Text>
      </TouchableOpacity>

    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    ...Platform.select({
      web: { boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s ease' },
      android: { elevation: 2 }
    }),
  },
  cardBlocked: {
      backgroundColor: '#fef2f2', // Light red bg for blocked users
      borderColor: '#fee2e2'
  },

  // Left Section
  leftSection: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  
  avatar: {
      width: 48, height: 48, borderRadius: 24,
      justifyContent: 'center', alignItems: 'center',
  },
  avatarUser: { backgroundColor: '#eff6ff' }, // Light blue
  avatarAdmin: { backgroundColor: '#fdf2f8' }, // Light pink (primary theme)
  
  avatarText: { fontSize: 18, fontWeight: '700' },
  textUser: { color: '#3b82f6' },
  textAdmin: { color: COLORS.primary },

  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 16, fontWeight: '700', color: '#111827' },
  
  adminBadge: { 
      flexDirection: 'row', alignItems: 'center', gap: 2,
      backgroundColor: COLORS.primary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 
  },
  adminText: { color: '#fff', fontSize: 9, fontWeight: '800' },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  infoText: { fontSize: 13, color: '#6b7280' },

  // Right Section (Button)
  actionBtn: {
      flexDirection: 'row', alignItems: 'center', gap: 6,
      paddingVertical: 8, paddingHorizontal: 12,
      borderRadius: 8,
      borderWidth: 1,
  },
  btnBlock: { backgroundColor: '#fff', borderColor: '#fee2e2' },
  btnUnblock: { backgroundColor: '#fff', borderColor: '#d1fae5' },
  
  btnText: { fontSize: 12, fontWeight: '700' }
});

export default UserItem;