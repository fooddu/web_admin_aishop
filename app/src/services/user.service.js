// src/services/user.service.js

import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
// Đảm bảo đường dẫn constants đúng (src/constants)
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants';

const ADMIN_API_URL = `${API_BASE_URL}/admin`; 

// ⚠️ QUAN TRỌNG: ĐỔI TÊN KEY THÀNH 'token' ĐỂ KHỚP VỚI DASHBOARD/ORDERS
const STORAGE_KEY = 'token';

// --- HÀM HELPER CHỌN CƠ CHẾ LƯU TRỮ ---
const setAuthToken = async (token) => {
    try {
        if (Platform.OS === 'web') {
            // Trên Web, dùng Local Storage/AsyncStorage
            await AsyncStorage.setItem(STORAGE_KEY, token);
            console.log(`DEBUG STORE: Đã lưu token vào AsyncStorage (Key: ${STORAGE_KEY})`);
        } else {
            // Trên Native (iOS/Android), dùng SecureStore
            await SecureStore.setItemAsync(STORAGE_KEY, token);
            console.log(`DEBUG STORE: Đã lưu token vào SecureStore (Key: ${STORAGE_KEY})`);
        }
    } catch (e) {
        console.error('❌ Lỗi khi lưu token:', e);
    }
}

const deleteAuthToken = async () => {
     try {
        if (Platform.OS === 'web') {
            await AsyncStorage.removeItem(STORAGE_KEY);
        } else {
            await SecureStore.deleteItemAsync(STORAGE_KEY);
        }
        console.log(`DEBUG STORE: Đã xóa token (Key: ${STORAGE_KEY})`);
    } catch (e) {
        console.error('❌ Lỗi khi xóa token:', e);
    }
}


/**
 * ⭐️ HÀM Đăng nhập CHỈ dành cho Admin
 */
export const loginAdmin = async (email, password) => {
    try {
        // GỌI ĐÚNG API ĐĂNG NHẬP ADMIN 
        const response = await axios.post(`${ADMIN_API_URL}/login`, {
            email,
            password,
        });
        
        // Kiểm tra cấu trúc trả về từ Server
        // Thường là: { success: true, token: "...", data: { ... } }
        // Hoặc: { token: "...", user: { ... } }
        // Bạn hãy điều chỉnh dòng dưới đây tùy theo response thực tế của Server
        const { token, data: user } = response.data; 

        if (!token) {
             throw new Error("Không nhận được Token từ Server");
        }

        // ⭐️ LƯU TOKEN VỚI KEY MỚI ('token') ⭐️
        await setAuthToken(token);
        
        return { token, user };
        
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Lỗi kết nối hoặc đăng nhập không thành công.';
        console.error('Lỗi khi đăng nhập Admin (Service):', error.response?.data || error.message);
        throw new Error(errorMessage);
    }
};


/**
 * Hàm Đăng xuất
 */
export const logoutUser = async () => {
    await deleteAuthToken();
};

/**
 * Hàm lấy token hiện tại
 */
export const getCurrentToken = async () => {
     try {
        if (Platform.OS === 'web') {
            const token = await AsyncStorage.getItem(STORAGE_KEY);
            return token;
        } else {
            const token = await SecureStore.getItemAsync(STORAGE_KEY);
            return token;
        }
    } catch (error) {
        console.error('Lỗi khi lấy token:', error);
        return null;
    }
}