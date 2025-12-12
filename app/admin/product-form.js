import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Check, ChevronDown, Image as ImageIcon, Save, Upload, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { API_BASE_URL, COLORS } from '../src/constants';

const ProductFormScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams(); 
  const isEditMode = !!id; 
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [categories, setCategories] = useState([]); 
  const [selectedCategory, setSelectedCategory] = useState(null); 
  const [showCategoryModal, setShowCategoryModal] = useState(false); 
  const [image, setImage] = useState(null); 
  const [isNewImage, setIsNewImage] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);

  // 1. Load Data
  useEffect(() => {
      fetchCategories(); 
      if (isEditMode) {
          fetchProductDetails();
      }
  }, [id]);
  const fetchCategories = async () => {
      try {
          const res = await fetch(`${API_BASE_URL}/categories`);
          const data = await res.json();
          if (data.success) {
              setCategories(data.data);
          }
      } catch (error) {
          console.error("Error fetching categories:", error);
      }
  };
  const fetchProductDetails = async () => {
      setInitialLoading(true);
      try {
          const response = await fetch(`${API_BASE_URL}/products/${id}`);
          const data = await response.json();
          if (data.success) {
              const product = data.data;
              setName(product.name);
              setDescription(product.description);
              setPrice(product.price.toString());
              setCountInStock(product.stock?.toString() || '0'); 
              if (product.category && typeof product.category === 'object') {
                  setSelectedCategory(product.category);
              } else if (product.category) {
                  setSelectedCategory({ _id: product.category, name: 'Loading...' });
              }
              if (product.image && product.image.length > 0) {
                  let imgUrl = product.image[0];
                  if (!imgUrl.startsWith('http')) {
                      const SERVER_URL = API_BASE_URL.replace('/api', '');
                      imgUrl = `${SERVER_URL}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
                  }
                  setImage(imgUrl);
              }
          }
      } catch (error) {
          Alert.alert("Error", "Could not load product details");
      } finally {
          setInitialLoading(false);
      }
  };
  // 2. Pick Image (Updated Aspect Ratio)
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      // ⭐ THAY ĐỔI: Tỷ lệ 1:1 để ảnh cắt ra là hình vuông
      aspect: [1, 1], 
      quality: 0.8,
    });
    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setIsNewImage(true); 
    }
  };
  // 3. Submit
  const handleSubmit = async () => {
    if (!name || !price || !countInStock || !selectedCategory) {
        const msg = "Please fill in all required fields and select a category.";
        if (Platform.OS === 'web') alert(msg);
        else Alert.alert("Missing Information", msg);
        return;
    }
    setLoading(true);
    try {
        const token = await AsyncStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('price', price);
        formData.append('countInStock', countInStock);
        formData.append('category', selectedCategory._id); 
        if (isNewImage && image) {
            if (Platform.OS === 'web') {
                const res = await fetch(image);
                const blob = await res.blob();
                formData.append('image', blob, 'product-image.jpg');
            } else {
                formData.append('image', {
                    uri: image,
                    name: 'product-image.jpg',
                    type: 'image/jpeg',
                });
            }
        }
        let url = `${API_BASE_URL}/products`;
        let method = 'POST';
        if (isEditMode) {
            url = `${API_BASE_URL}/products/${id}`;
            method = 'PUT'; 
        }
        const response = await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await response.json();
        if (response.ok && data.success) {
            const msg = isEditMode ? "Product updated!" : "Product created!";
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert("Success", msg);
            router.back();
        } else {
            alert("Error: " + (data.message || "Operation failed"));
        }
    } catch (error) {
        alert("Connection Error. Please try again.");
    } finally {
        setLoading(false);
    }
  };
  if (initialLoading) {
      return (
          <View style={[styles.container, styles.center]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
      );
  }
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
            {isEditMode ? 'Edit Product' : 'Add New Product'}
        </Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage} activeOpacity={0.8}>
            {image ? (
                <>
                    <Image source={{ uri: image }} style={styles.previewImage} />
                    <View style={styles.editImageOverlay}>
                        <Upload size={20} color="#fff" />
                        <Text style={styles.editImageText}>Change</Text>
                    </View>
                </>
            ) : (
                <View style={styles.imagePlaceholder}>
                    <View style={styles.iconCircle}>
                        <ImageIcon size={32} color={COLORS.primary} />
                    </View>
                    <Text style={styles.imageTextPrimary}>Upload Image</Text>
                </View>
            )}
        </TouchableOpacity>
        {/* Form Section */}
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Basic Information</Text>
            
            <View style={styles.formGroup}>
                <Text style={styles.label}>Product Name <Text style={styles.required}>*</Text></Text>
                <TextInput style={styles.input} placeholder="e.g. Cotton T-Shirt" value={name} onChangeText={setName} />
            </View>
            <View style={styles.row}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 16 }]}>
                    <Text style={styles.label}>Price ($) <Text style={styles.required}>*</Text></Text>
                    <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={price} onChangeText={setPrice} />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Stock <Text style={styles.required}>*</Text></Text>
                    <TextInput style={styles.input} placeholder="0" keyboardType="numeric" value={countInStock} onChangeText={setCountInStock} />
                </View>
            </View>
            {/* Category Dropdown */}
            <View style={styles.formGroup}>
                <Text style={styles.label}>Category <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity 
                    style={styles.dropdownButton} 
                    onPress={() => setShowCategoryModal(true)}
                >
                    <Text style={{ color: selectedCategory ? '#1f2937' : '#9ca3af', fontSize: 15 }}>
                        {selectedCategory ? selectedCategory.name : "Select a Category"}
                    </Text>
                    <ChevronDown size={20} color="#6b7280" />
                </TouchableOpacity>
            </View>
            <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput 
                    style={[styles.input, styles.textArea]} 
                    placeholder="Enter description..." 
                    multiline numberOfLines={4}
                    value={description} onChangeText={setDescription} 
                />
            </View>
        </View>
        {/* Submit Button */}
        <TouchableOpacity 
            style={[styles.submitButton, loading && styles.buttonDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
        >
            {loading ? <ActivityIndicator color="#fff" /> : (
                <>
                    <Save size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.submitText}>{isEditMode ? 'Update Product' : 'Save Product'}</Text>
                </>
            )}
        </TouchableOpacity>
      </ScrollView>
      {/* Modal Category */}
      <Modal visible={showCategoryModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Select Category</Text>
                    <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                        <X size={24} color="#374151" />
                    </TouchableOpacity>
                </View>      
                <FlatList 
                    data={categories}
                    keyExtractor={item => item._id}
                    renderItem={({item}) => (
                        <TouchableOpacity 
                            style={[
                                styles.categoryItem, 
                                selectedCategory?._id === item._id && styles.categoryItemSelected
                            ]}
                            onPress={() => {
                                setSelectedCategory(item);
                                setShowCategoryModal(false);
                            }}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory?._id === item._id && styles.categoryTextSelected
                            ]}>
                                {item.name}
                            </Text>
                            {selectedCategory?._id === item._id && (
                                <Check size={20} color={COLORS.primary} />
                            )}
                        </TouchableOpacity>
                    )}
                    ListEmptyComponent={
                        <Text style={{textAlign: 'center', padding: 20, color: '#999'}}>No categories found.</Text>
                    }
                />
            </View>
        </View>
      </Modal>
    </View>
  );
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f3f4f6' },
  center: { justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#e5e7eb',
    ...Platform.select({ web: { boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }, android: { elevation: 2 } })
  },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontWeight: '700', color: '#111827' },
  content: { padding: 24, maxWidth: 800, alignSelf: 'center', width: '100%' },
  
  // ⭐ THAY ĐỔI Ở ĐÂY: IMAGE STYLES ⭐
  imagePicker: {
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
    backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden',
    // 1. Xóa height cố định: height: 240, 
    // 2. Thêm width và aspectRatio để vuông
    width: '100%', 
    aspectRatio: 1, 
    borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed'
  },
  imagePlaceholder: { alignItems: 'center' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fdf2f8', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  imageTextPrimary: { fontSize: 16, fontWeight: '600', color: '#374151' },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  editImageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.5)', padding: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  editImageText: { color: '#fff', fontWeight: '600' },
  // Form Styles
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 20 },
  formGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  required: { color: '#ef4444' },
  input: { backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 14, fontSize: 15, color: '#1f2937' },
  dropdownButton: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f9fafb', borderWidth: 1, borderColor: '#d1d5db', borderRadius: 10, padding: 14 },
  textArea: { height: 120, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  // Button Styles
  submitButton: { flexDirection: 'row', backgroundColor: COLORS.primary, paddingVertical: 16, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 40 },
  buttonDisabled: { opacity: 0.7 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '60%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#f3f4f6', paddingBottom: 15 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  categoryItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  categoryItemSelected: { backgroundColor: '#fdf2f8', paddingHorizontal: 10, borderRadius: 8, borderBottomWidth: 0 },
  categoryText: { fontSize: 16, color: '#374151' },
  categoryTextSelected: { color: COLORS.primary, fontWeight: '600' }
});
export default ProductFormScreen;