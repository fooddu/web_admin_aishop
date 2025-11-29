import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Platform,
  ScrollView,
  StyleSheet, Text,
  TouchableOpacity,
  View
} from 'react-native';

// Import Thư viện Biểu đồ
import { LineChart } from "react-native-chart-kit";

// Import Component & Constants
import StatCard from '../src/components/StatCard';
import { API_BASE_URL, COLORS } from '../src/constants';

const screenWidth = Dimensions.get("window").width;

const DashboardScreen = () => {
  // 1. State Thống kê tổng quan (Cards)
  const [statsData, setStatsData] = useState({
    orders: 0, revenue: 0, users: 0, products: 0
  });
  
  // 2. State Biểu đồ
  const [chartData, setChartData] = useState({
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      datasets: [{ data: [0, 0, 0, 0, 0, 0] }]
  });
  
  const [filterType, setFilterType] = useState('year'); // Mặc định xem theo Năm
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);

  // --- API 1: Lấy số liệu tổng quan (Cards) ---
  const fetchDashboardStats = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/orders/get/dashboard-stats`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const resJson = await response.json();
      if (resJson.success) {
        setStatsData(resJson.data);
      }
    } catch (error) {
      console.error('Lỗi lấy thống kê:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- API 2: Lấy dữ liệu Biểu đồ (Chart) ---
  const fetchChartData = async (type) => {
      setChartLoading(true);
      try {
          const token = await AsyncStorage.getItem('token');
          // Gọi API Analytics
          const response = await fetch(`${API_BASE_URL}/orders/get/analytics?type=${type}`, {
              headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}` 
              },
          });
          const res = await response.json();
          
          if (res.success) {
              processChartData(res.data, type);
          }
      } catch (err) { 
          console.error('Lỗi Chart:', err); 
      } finally { 
          setChartLoading(false); 
      }
  };

  // --- LOGIC: Xử lý dữ liệu thô thành dữ liệu Biểu đồ ---
  const processChartData = (data, type) => {
      let labels = [];
      let values = [];

      if (type === 'year') {
          // Năm: Labels là tháng 1 -> 12
          labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          values = new Array(12).fill(0);
          
          data.forEach(item => {
              // item._id là số tháng (1-12) -> index mảng là (item._id - 1)
              if (item._id >= 1 && item._id <= 12) {
                  values[item._id - 1] = item.totalSales; 
              }
          });
      } 
      else if (type === 'week') {
          // Tuần: Hiển thị Ngày/Tháng
          data.forEach(item => {
              // item._id dạng "2023-10-25" -> Lấy "25/10"
              const datePart = item._id.split('-'); 
              if (datePart.length === 3) {
                  labels.push(`${datePart[2]}/${datePart[1]}`);
                  values.push(item.totalSales);
              }
          });
      }
      else {
          // Month (ngày trong tháng) hoặc Day (giờ trong ngày)
           data.forEach(item => {
              if (type === 'day') {
                   labels.push(`${item._id}h`); // Giờ
              } else {
                  // item._id dạng "2023-10-25" -> Lấy ngày "25"
                  const d = item._id.split('-');
                  labels.push(d[2]); 
              }
              values.push(item.totalSales);
          });
      }

      // Nếu dữ liệu rỗng (để tránh lỗi crash chart)
      if (labels.length === 0) {
          labels = ["No Data"];
          values = [0];
      }

      setChartData({
          labels: labels,
          datasets: [{ data: values }]
      });
  };

  // --- USE EFFECTS ---
  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Gọi lại API biểu đồ mỗi khi đổi bộ lọc
  useEffect(() => {
      fetchChartData(filterType);
  }, [filterType]);

  // --- UI Component con: Nút Lọc ---
  const FilterButton = ({ title, value }) => (
      <TouchableOpacity 
        style={[styles.filterBtn, filterType === value && styles.filterBtnActive]}
        onPress={() => setFilterType(value)}
      >
          <Text style={[styles.filterText, filterType === value && styles.filterTextActive]}>
              {title}
          </Text>
      </TouchableOpacity>
  );

  // --- CHUẨN BỊ DỮ LIỆU CARD ---
  const stats = [
    { title: 'Total Orders', value: statsData.orders.toLocaleString(), color: COLORS.text },
    { title: 'Total Revenue', value: `$${statsData.revenue.toLocaleString()}`, color: '#10b981' }, 
    { title: 'Total Users', value: statsData.users.toLocaleString(), color: COLORS.text },
    { title: 'Products in Stock', value: statsData.products.toLocaleString(), color: COLORS.text },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <Text style={styles.pageTitle}>Dashboard</Text>
      <Text style={styles.overviewTitle}>Overview</Text>

      {/* 1. CARDS THỐNG KÊ */}
      <View style={styles.statsRow}>
        {stats.map((stat, index) => (
          <StatCard 
            key={index} 
            title={stat.title} 
            value={stat.value} 
            color={stat.color} 
          />
        ))}
      </View>

      {/* 2. BIỂU ĐỒ DOANH THU */}
      <View style={styles.chartContainer}>
          <View style={styles.chartHeader}>
              <Text style={styles.chartTitle}>Revenue Analytics</Text>
              
              {/* Bộ lọc */}
              <View style={styles.filterContainer}>
                  <FilterButton title="Day" value="day" />
                  <FilterButton title="Week" value="week" />
                  <FilterButton title="Month" value="month" />
                  <FilterButton title="Year" value="year" />
              </View>
          </View>

          {chartLoading ? (
               <View style={{height: 220, justifyContent: 'center'}}>
                   <ActivityIndicator color={COLORS.primary} />
               </View>
          ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <LineChart
                    data={chartData}
                    // Tự động tính chiều rộng: Nếu ít cột thì lấy full màn hình, nhiều cột thì dãn ra để scroll
                    width={Math.max(screenWidth - 60, chartData.labels.length * 50)} 
                    height={220}
                    
                    // --- CẤU HÌNH TRỤC Y ĐỂ HIỂN THỊ ĐÚNG SỐ TIỀN ---
                    yAxisLabel="$" 
                    yAxisSuffix=""  // Xóa chữ "k" mặc định
                    fromZero={true} // Bắt đầu từ số 0
                    segments={4}    // Chia lưới thành 4 phần cho chẵn
                    formatYLabel={(value) => Math.floor(value).toLocaleString()} // Format số: 1,000
                    
                    chartConfig={{
                        backgroundColor: "#ffffff",
                        backgroundGradientFrom: "#ffffff",
                        backgroundGradientTo: "#ffffff",
                        decimalPlaces: 0, // Không hiển thị số lẻ
                        // Màu đường kẻ và điểm (Màu hồng chủ đạo)
                        color: (opacity = 1) => `rgba(255, 77, 128, ${opacity})`, 
                        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                        style: { borderRadius: 16 },
                        propsForDots: { r: "5", strokeWidth: "2", stroke: "#ffa726" }
                    }}
                    bezier // Đường cong mềm mại
                    style={{ marginVertical: 8, borderRadius: 16 }}
                />
              </ScrollView>
          )}
      </View>

      <View style={{height: 50}} /> 
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f9fa' 
  },
  center: {
    justifyContent: 'center', 
    alignItems: 'center', 
    flex: 1
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 25,
  },
  overviewTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap', 
    marginBottom: 30,
    gap: 15 
  },
  
  // Style cho Container Biểu đồ
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      web: { boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' },
      android: { elevation: 3 }
    }),
    marginBottom: 20
  },
  chartHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      flexWrap: 'wrap',
      gap: 10
  },
  chartTitle: { 
      fontSize: 18, 
      fontWeight: 'bold', 
      color: '#333' 
  },
  // Style cho Bộ lọc
  filterContainer: { 
      flexDirection: 'row', 
      backgroundColor: '#f1f3f5', 
      borderRadius: 8, 
      padding: 4 
  },
  filterBtn: { 
      paddingVertical: 6, 
      paddingHorizontal: 12, 
      borderRadius: 6 
  },
  filterBtnActive: { 
      backgroundColor: '#fff', 
      shadowColor: '#000', 
      shadowOpacity: 0.1, 
      shadowRadius: 2,
      elevation: 1
  },
  filterText: { 
      fontSize: 12, 
      color: '#666', 
      fontWeight: '600' 
  },
  filterTextActive: { 
      color: COLORS.primary 
  }
});

export default DashboardScreen;