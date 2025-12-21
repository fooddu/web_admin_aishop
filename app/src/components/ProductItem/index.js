import { Edit3, Eye, EyeOff } from 'lucide-react-native';
import React, { useState } from 'react';
import { Image, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { API_BASE_URL, COLORS } from '../../constants';

const ProductItemGrid = ({ item, onEdit, onToggleStatus }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Format Currency (VND)
  const formattedPrice = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0,
  }).format(item.price || 0);

  // --- Image URL Helper ---
  const getImageUrl = (imageData) => {
    if (!imageData || imageData.length === 0) return 'https://via.placeholder.com/300x300?text=No+Image';
    
    let imagePath = Array.isArray(imageData) ? imageData[0] : imageData;
    if (imagePath.startsWith('http')) return imagePath;
    
    // Remove '/api' from base URL if present to point to static folder
    const SERVER_URL = API_BASE_URL.replace('/api', ''); 
    let finalPath = imagePath.startsWith('/uploads') ? imagePath : `/uploads${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
    
    return `${SERVER_URL}${finalPath}`; 
  };
    
  const finalImageUrl = getImageUrl(item.image);
  const realStock = (item.stock !== undefined) ? item.stock : (item.countInStock || 0);
  const isActive = item.isActive !== undefined ? item.isActive : true;

  return (
    <View 
        style={[
            styles.cardContainer, 
            !isActive && styles.hiddenCardContainer,
            Platform.OS === 'web' && isHovered && styles.cardHover, 
        ]}
        onMouseEnter={() => Platform.OS === 'web' && setIsHovered(true)}
        onMouseLeave={() => Platform.OS === 'web' && setIsHovered(false)}
    >
      {/* 1. Status Badge (Top Right) */}
      <View style={[styles.statusBadge, isActive ? styles.statusActive : styles.statusInactive]}>
          <Text style={styles.statusText}>{isActive ? 'Active' : 'Hidden'}</Text>
      </View>

      {/* 2. Image Area */}
      <View style={styles.imageWrapper}>
          <Image 
            source={{ uri: finalImageUrl }} 
            style={styles.image} 
            resizeMode="cover"
          />
      </View>

      {/* 3. Content Area */}
      <View style={styles.contentContainer}>
        <Text style={styles.productName} numberOfLines={1} ellipsizeMode='tail'>
            {item.name || 'Unnamed Product'}
        </Text>
        
        <Text style={styles.productPrice}>{formattedPrice}</Text>

        {/* Info Grid: Category & Stock */}
        <View style={styles.infoRow}>
            <View style={styles.infoCol}>
                <Text style={styles.label}>Category</Text>
                <Text style={styles.value} numberOfLines={1}>
                    {item.category?.name || item.category || 'N/A'}
                </Text>
            </View>
            <View style={[styles.infoCol, { alignItems: 'flex-end' }]}>
                <Text style={styles.label}>Stock</Text>
                <Text style={[styles.value, realStock === 0 && styles.textRed]}>
                    {realStock}
                </Text>
            </View>
        </View>
      </View>

      {/* 4. Action Buttons (Bottom) */}
      <View style={styles.actionRow}>
        <TouchableOpacity 
            style={[styles.btn, styles.btnEdit]} 
            onPress={() => onEdit(item)}
            activeOpacity={0.8}
        >
          <Edit3 size={16} color="#fff" />
          <Text style={styles.btnText}>Edit</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
            style={[styles.btn, isActive ? styles.btnHide : styles.btnShow]} 
            onPress={() => onToggleStatus(item._id, !isActive)} 
            activeOpacity={0.8}
        >
          {isActive ? <EyeOff size={16} color="#fff" /> : <Eye size={16} color="#fff" />}
          <Text style={styles.btnText}>{isActive ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 8,
    flex: 1,
    overflow: 'hidden',
    // Responsive width for grid layout
    width: Platform.OS === 'web' ? 'calc(50% - 16px)' : undefined,
    minWidth: 280, // Ensures cards don't get too small on mobile
    maxWidth: Platform.OS === 'web' ? 400 : undefined, // Max width on large screens
    
    // Shadow
    ...Platform.select({
      web: { 
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)', 
        border: '1px solid #f0f0f0',
        transition: 'all 0.3s ease'
      },
      android: { elevation: 3 },
      ios: { shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } }
    }),
  },
  cardHover: {
    ...Platform.select({
        web: {
            boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
            transform: [{ translateY: -4 }]
        }
    })
  },
  hiddenCardContainer: { 
    opacity: 0.6,
    // Add a grayscale filter effect for hidden items on web for better UX
    ...Platform.select({ web: { filter: 'grayscale(100%)' } }) 
  },

  // --- Status Badge ---
  statusBadge: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 10,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 20,
  },
  statusActive: { backgroundColor: 'rgba(16, 185, 129, 0.9)' }, // Green
  statusInactive: { backgroundColor: 'rgba(107, 114, 128, 0.9)' }, // Gray
  statusText: { color: '#fff', fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },

  // --- Image ---
  imageWrapper: {
      width: '100%',
      aspectRatio: 4/3, // Standard product ratio
      backgroundColor: '#f9fafb',
      borderBottomWidth: 1,
      borderBottomColor: '#f3f4f6',
  },
  image: {
    width: '100%',
    height: '100%',
  },

  // --- Content ---
  contentContainer: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937', // Dark gray
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary || '#ec4899', // Pink brand color
    marginBottom: 12,
  },
  infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: '#f9fafb', // Light gray background for info
      borderRadius: 8,
      padding: 10,
  },
  infoCol: {
      flex: 1,
  },
  label: {
      fontSize: 11,
      color: '#9ca3af', // Light gray text
      textTransform: 'uppercase',
      fontWeight: '600',
      marginBottom: 2,
  },
  value: {
      fontSize: 13,
      color: '#4b5563', // Medium gray
      fontWeight: '500',
  },
  textRed: { color: '#ef4444', fontWeight: '700' },

  // --- Actions ---
  actionRow: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 10,
  },
  btn: {
    flex: 1,
    height: 38,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  btnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  btnEdit: {
    backgroundColor: '#3b82f6', // Blue
  },
  btnShow: { 
    backgroundColor: '#10b981', // Green
  },
  btnHide: { 
    backgroundColor: '#6b7280', // Gray
  }
});

export default ProductItemGrid;