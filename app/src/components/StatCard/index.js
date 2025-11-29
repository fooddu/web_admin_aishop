import React from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { COLORS } from '../../constants'; // Đảm bảo đường dẫn constants là đúng

const StatCard = ({ title, value, color }) => {
  // Chọn màu cho giá trị (ví dụ: Revenue thường là màu xanh)
  const valueColor = color ? color : COLORS.text;
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    // Chiếm 1/4 diện tích và có khoảng cách
    width: '23.5%', 
    padding: 20,
    backgroundColor: COLORS.background, // Màu trắng
    borderRadius: 8,
    // Sử dụng boxShadow cho Web (thay thế cho shadow props bị cảnh báo)
    ...Platform.select({
      web: {
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      },
      // Dùng shadow prop cho mobile nếu cần
      android: {
        elevation: 3,
      },
    }),
    marginVertical: 10,
  },
  title: {
    fontSize: 14,
    color: COLORS.textInactive,
    marginBottom: 8,
    fontWeight: '500',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
});

export default StatCard;