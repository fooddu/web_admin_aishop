import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router'; // Thêm useLocalSearchParams
import { ArrowLeft, Save, Upload } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator, Alert,
    Image, Platform,
    ScrollView,
    StyleSheet,
    Text, TextInput,
    TouchableOpacity,
    View
} from 'react-native';

import { API_BASE_URL, COLORS } from '../src/constants';

const ProductFormScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Lấy ID từ URL (nếu có)
  const isEditMode = !!id; // Kiểm tra xem đang ở chế độ Sửa hay Thêm

  // State form
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState(null); // Lưu URI ảnh (Link cũ hoặc File mới)
  const [isNewImage, setIsNewImage] = useState(false); // Cờ đánh dấu có chọn ảnh mới không
  
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false); // Loading khi lấy dữ liệu cũ

  // 1. [Mode Sửa] Lấy dữ liệu sản phẩm cũ
  useEffect(() => {
      if (isEditMode) {
          fetchProductDetails();
      }
  }, [id]);

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
              // Lấy stock từ DB map vào countInStock
              setCountInStock(product.stock?.toString() || '0'); 
              setCategory(product.category || '');
              
              // Xử lý ảnh cũ hiển thị lên
              if (product.image && product.image.length > 0) {
                  // Xử lý link ảnh để hiển thị đúng
                  let imgUrl = product.image[0];
                  if (!imgUrl.startsWith('http')) {
                      const SERVER_URL = API_BASE_URL.replace('/api', '');
                      imgUrl = `${SERVER_URL}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;
                  }
                  setImage(imgUrl);
              }
          }
      } catch (error) {
          console.error("Lỗi lấy chi tiết:", error);
          Alert.alert("Lỗi", "Không lấy được thông tin sản phẩm");
      } finally {
          setInitialLoading(false);
      }
  };

  // 2. Hàm chọn ảnh
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setIsNewImage(true); // Đánh dấu là đã chọn ảnh mới
    }
  };

  // 3. Hàm Gửi dữ liệu (Xử lý cả Thêm và Sửa)
  const handleSubmit = async () => {
    if (!name || !price || !countInStock) {
        Alert.alert("Thiếu thông tin", "Vui lòng nhập các trường bắt buộc (*).");
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
        formData.append('category', category);

        // Chỉ gửi file ảnh nếu người dùng chọn ảnh mới
        if (isNewImage && image) {
            if (Platform.OS === 'web') {
                const res = await fetch(image);
                const blob = await res.blob();
                formData.append('image', blob, 'updated-image.jpg');
            } else {
                formData.append('image', {
                    uri: image,
                    name: 'updated-image.jpg',
                    type: 'image/jpeg',
                });
            }
        }

        // Xác định URL và Method
        let url = `${API_BASE_URL}/products`;
        let method = 'POST';

        if (isEditMode) {
            url = `${API_BASE_URL}/products/${id}`;
            method = 'PUT'; // Sửa dùng PUT
        }

        const response = await fetch(url, {
            method: method,
            headers: {
                'Authorization': `Bearer ${token}`,
                // Không set Content-Type JSON vì dùng FormData
            },
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.success) {
            const msg = isEditMode ? "Cập nhật thành công!" : "Thêm mới thành công!";
            if (Platform.OS === 'web') alert(msg);
            else Alert.alert("Thành công", msg);
            router.back();
        } else {
            alert("Lỗi: " + (data.message || "Thao tác thất bại"));
        }

    } catch (error) {
        console.error("Lỗi submit:", error);
        alert("Lỗi kết nối server.");
    } finally {
        setLoading(false);
    }
  };

  if (initialLoading) {
      return (
          <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={{ marginTop: 10 }}>Đang tải dữ liệu...</Text>
          </View>
      );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
            {isEditMode ? 'Chỉnh Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Ảnh */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
            {image ? (
                <Image source={{ uri: image }} style={styles.previewImage} />
            ) : (
                <View style={styles.imagePlaceholder}>
                    <Upload size={40} color={COLORS.textInactive} />
                    <Text style={styles.imageText}>Tải ảnh sản phẩm</Text>
                </View>
            )}
            {/* Nút nhỏ báo hiệu thay đổi ảnh */}
            <View style={styles.editIconBadge}>
                <Upload size={14} color="#fff" />
            </View>
        </TouchableOpacity>

        {/* Form */}
        <View style={styles.formGroup}>
            <Text style={styles.label}>Tên sản phẩm *</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Nhập tên sản phẩm" 
                value={name} onChangeText={setName} 
            />
        </View>

        <View style={styles.row}>
            <View style={[styles.formGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Giá (VNĐ) *</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="0" 
                    keyboardType="numeric"
                    value={price} onChangeText={setPrice} 
                />
            </View>
            <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Kho (Tồn) *</Text>
                <TextInput 
                    style={styles.input} 
                    placeholder="0" 
                    keyboardType="numeric"
                    value={countInStock} onChangeText={setCountInStock} 
                />
            </View>
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Danh mục</Text>
            <TextInput 
                style={styles.input} 
                placeholder="Ví dụ: Áo thun" 
                value={category} onChangeText={setCategory} 
            />
        </View>

        <View style={styles.formGroup}>
            <Text style={styles.label}>Mô tả</Text>
            <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Mô tả chi tiết..." 
                multiline numberOfLines={4}
                value={description} onChangeText={setDescription} 
            />
        </View>

        <TouchableOpacity 
            style={styles.submitButton} 
            onPress={handleSubmit}
            disabled={loading}
        >
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <>
                    <Save size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.submitText}>
                        {isEditMode ? 'Cập Nhật' : 'Lưu Sản Phẩm'}
                    </Text>
                </>
            )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#eee'
  },
  backButton: { marginRight: 15 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: COLORS.text },
  content: { padding: 20 },
  
  imagePicker: {
    alignItems: 'center', justifyContent: 'center', marginBottom: 25,
    backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden',
    height: 200, borderWidth: 1, borderColor: '#ddd', position: 'relative'
  },
  imagePlaceholder: { alignItems: 'center' },
  imageText: { color: COLORS.textInactive, marginTop: 10 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'contain', backgroundColor: '#f9f9f9' },
  editIconBadge: {
      position: 'absolute', bottom: 10, right: 10, 
      backgroundColor: 'rgba(0,0,0,0.6)', padding: 6, borderRadius: 20
  },

  formGroup: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, fontSize: 16, color: '#333'
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },

  submitButton: {
    flexDirection: 'row', backgroundColor: COLORS.primary, padding: 15,
    borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 10, marginBottom: 40
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});

export default ProductFormScreen;