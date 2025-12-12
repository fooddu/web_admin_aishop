import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    StyleSheet,
    Text, TextInput, TouchableOpacity,
    View
} from 'react-native';

// ✅ IMPORT CHUẨN TỪ CONSTANTS
// Lưu ý: Đường dẫn ../../ là để lùi từ 'app/admin' về thư mục gốc chứa 'src'
import { API_BASE_URL, COLORS } from '../src/constants';

export default function CategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(false);

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [inputValue, setInputValue] = useState('');

  // Helper endpoint variable
  const ENDPOINT = `${API_BASE_URL}/categories`;

  // 1. Load List
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch(ENDPOINT);
      const data = await res.json();
      if (data.success) {
        setCategories(data.data);
        setFilteredData(data.data);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 2. Search
  const handleSearch = (text) => {
    setSearchText(text);
    if (text) {
      const newData = categories.filter(item => 
        item.name.toUpperCase().includes(text.toUpperCase())
      );
      setFilteredData(newData);
    } else {
      setFilteredData(categories);
    }
  };

  // 3. Open Modal
  const openAddModal = () => {
    setIsEditing(false);
    setInputValue('');
    setModalVisible(true);
  };

  const openEditModal = (item) => {
    setIsEditing(true);
    setCurrentId(item._id);
    setInputValue(item.name);
    setModalVisible(true);
  };

  // 4. Save
  const handleSave = async () => {
    if (!inputValue.trim()) {
      alert("Please enter a category name!");
      return;
    }

    try {
      const url = isEditing ? `${ENDPOINT}/${currentId}` : ENDPOINT;
      const method = isEditing ? 'PUT' : 'POST'; 
      
      const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: inputValue.trim() })
      });
      const data = await res.json();

      if (data.success || res.status === 201 || res.status === 200) {
        setModalVisible(false);
        setInputValue('');
        fetchCategories();
      } else {
        alert(data.message || "Server Error");
      }
    } catch (error) {
      alert("Connection Error. Check API_BASE_URL in constants.");
    }
  };

  // 5. Toggle Status
  const handleToggleStatus = async (item) => {
    try {
      const res = await fetch(`${ENDPOINT}/${item._id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      
      if (data.success) {
        const updatedList = categories.map(cat => 
          cat._id === item._id ? { ...cat, isActive: !cat.isActive } : cat
        );
        setCategories(updatedList);
        setFilteredData(updatedList); 
      } else {
        alert("Error: " + data.message);
      }
    } catch (error) {
      alert("Connection Error");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={styles.title}>Category Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={COLORS.textInactive} style={{ marginRight: 10 }} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search..."
          value={searchText}
          onChangeText={handleSearch}
        />
      </View>

      {/* List */}
      {loading ? <ActivityIndicator size="large" color={COLORS.primary} /> : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[styles.card, !item.isActive && styles.cardHidden]}>
              <View style={styles.cardInfo}>
                <Ionicons 
                  name={item.isActive ? "layers" : "eye-off"} 
                  size={24} 
                  // ✅ Sử dụng COLORS.primary thay vì mã màu cứng
                  color={item.isActive ? COLORS.primary : COLORS.textInactive} 
                  style={{ marginRight: 15 }}
                />
                <Text style={[styles.cardTitle, !item.isActive && {color: COLORS.textInactive}]}>
                  {item.name} { !item.isActive && "(Hidden)" }
                </Text>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.editBtn]} 
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons name="pencil" size={18} color="#2196F3" />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.actionBtn, item.isActive ? styles.hideBtn : styles.showBtn]} 
                  onPress={() => handleToggleStatus(item)}
                >
                  <Ionicons 
                    name={item.isActive ? "eye-off" : "eye"} 
                    size={18} 
                    color={item.isActive ? "#FF9800" : "#4CAF50"} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text style={styles.emptyText}>No categories found.</Text>}
        />
      )}

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isEditing ? "Edit Category" : "Add New Category"}</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter name..."
              value={inputValue}
              onChangeText={setInputValue}
            />
            <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                    <Text style={{color: COLORS.text}}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
                    <Text style={{color: 'white', fontWeight: 'bold'}}>Save</Text>
                </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  
  // ✅ Dùng COLORS cho text
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text },
  
  // ✅ Dùng COLORS.primary cho nút
  addButton: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 8 },
  addButtonText: { color: 'white', fontWeight: 'bold' },
  
  searchContainer: { flexDirection: 'row', backgroundColor: 'white', padding: 10, borderRadius: 10, marginBottom: 20, alignItems: 'center' },
  searchInput: { flex: 1, outlineStyle: 'none', fontSize: 16 },
  
  card: { flexDirection: 'row', backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 10, alignItems: 'center', justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  cardHidden: { backgroundColor: '#f0f0f0', opacity: 0.8 },
  cardInfo: { flexDirection: 'row', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', color: COLORS.text },
  
  actionButtons: { flexDirection: 'row' },
  actionBtn: { padding: 8, borderRadius: 6, marginLeft: 8 },
  editBtn: { backgroundColor: '#E3F2FD' },
  hideBtn: { backgroundColor: '#FFF3E0' },
  showBtn: { backgroundColor: '#E8F5E9' },
  
  emptyText: { textAlign: 'center', marginTop: 50, color: COLORS.textInactive },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: 350, backgroundColor: 'white', padding: 20, borderRadius: 15 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: COLORS.text },
  modalInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 20 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10 },
  cancelButton: { padding: 10 },
  
  // ✅ Dùng COLORS.primary cho nút Lưu
  saveButton: { backgroundColor: COLORS.primary, padding: 10, borderRadius: 8, paddingHorizontal: 20 }
});