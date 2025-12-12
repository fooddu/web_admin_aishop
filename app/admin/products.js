import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { Plus, Search } from 'lucide-react-native';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

import ProductItem from '../src/components/ProductItem';
import { API_BASE_URL, COLORS } from '../src/constants';

const ProductsScreen = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Responsive columns: Web = 3 (or 2 depending on width), Mobile = 1
  const columns = Platform.OS === 'web' ? 3 : 1; 

  // 1. Fetch Products
  const fetchProducts = async () => {
    try {
        const token = await AsyncStorage.getItem('token');
        const response = await fetch(`${API_BASE_URL}/products`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();

        if (data.success) {
            setProducts(data.data || []);
            setFilteredData(data.data || []);
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  // 2. Search Function
  const handleSearch = (text) => {
      setSearchText(text);
      if (text) {
          const newData = products.filter(item => {
              const itemData = item.name ? item.name.toUpperCase() : ''.toUpperCase();
              const textData = text.toUpperCase();
              return itemData.indexOf(textData) > -1;
          });
          setFilteredData(newData);
      } else {
          setFilteredData(products);
      }
  };

  // 3. Toggle Status (Active/Hidden)
  const handleToggleStatus = async (id, currentStatus) => {
        const action = currentStatus ? "show" : "hide";
        
        if (Platform.OS === 'web') {
            if (!window.confirm(`Are you sure you want to ${action} this product?`)) return;
        }

        try {
            const token = await AsyncStorage.getItem('token');
            const response = await fetch(`${API_BASE_URL}/products/${id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({ isActive: currentStatus }) 
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Update local list without reloading
                const updatedList = products.map(item => 
                    item._id === id ? { ...item, isActive: currentStatus } : item
                );
                setProducts(updatedList);
                
                // Update filtered list as well if searching
                if (searchText) {
                    setFilteredData(prev => prev.map(item => 
                        item._id === id ? { ...item, isActive: currentStatus } : item
                    ));
                } else {
                    setFilteredData(updatedList);
                }

            } else {
                alert(data.message || "Action failed");
            }
        } catch (error) {
            console.error(`Error ${action}:`, error);
            alert("Connection error");
        }
    };

  // 4. Navigation
  const handleCreate = () => router.push('/admin/product-form');
  
  const handleEdit = (item) => {
      router.push({ pathname: '/admin/product-form', params: { id: item._id } });
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <View style={styles.headerRow}>
        <View>
            <Text style={styles.pageTitle}>Product Management</Text>
            <Text style={styles.subTitle}>Manage your product catalog</Text>
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleCreate}>
            <Plus size={18} color="#fff" />
            <Text style={styles.addButtonText}>Add New</Text>
        </TouchableOpacity>
      </View>

      {/* SEARCH BAR (New Feature) */}
      <View style={styles.searchContainer}>
        <Search size={20} color={COLORS.textInactive} style={{marginRight: 10}} />
        <TextInput 
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchText}
            onChangeText={handleSearch}
        />
      </View>

      {/* PRODUCT LIST */}
      {loading ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
            data={filteredData}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
                <ProductItem 
                    item={item} 
                    onEdit={handleEdit}     
                    onToggleStatus={handleToggleStatus}                
                />
            )}
            // Force re-render when columns change
            key={columns} 
            numColumns={columns} 
            contentContainerStyle={styles.listContainer}
            columnWrapperStyle={columns > 1 ? styles.columnWrapper : null}
            
            onRefresh={() => {
                setRefreshing(true);
                fetchProducts();
            }}
            refreshing={refreshing}
            ListEmptyComponent={
                <Text style={styles.emptyText}>No products found.</Text>
            }
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24, // Increased padding for better spacing
    backgroundColor: '#f8f9fa',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827', // Darker text
    marginBottom: 4,
  },
  subTitle: {
    fontSize: 14,
    color: '#6b7280', // Gray text
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
    ...Platform.select({
        web: { 
            boxShadow: '0 4px 6px -1px rgba(255, 77, 128, 0.3)',
            cursor: 'pointer',
            transition: 'all 0.2s'
        }
    })
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  
  // Search Styles
  searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#fff',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 12,
      marginBottom: 24,
      borderWidth: 1,
      borderColor: '#e5e7eb',
  },
  searchInput: {
      flex: 1,
      fontSize: 15,
      color: '#374151',
      outlineStyle: 'none', // Remove web outline
  },

  // List Styles
  listContainer: {
    paddingBottom: 40,
  },
  columnWrapper: {
      justifyContent: 'flex-start',
      gap: 16, // Gap between grid items
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 60,
    color: '#9ca3af',
    fontSize: 16,
    fontStyle: 'italic',
  }
});

export default ProductsScreen;