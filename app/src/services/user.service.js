import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE_URL } from '../constants';

// Route API là /users theo code backend của bạn
const USER_API_URL = `${API_BASE_URL}/users`; 
const STORAGE_KEY_TOKEN = 'token';

export const loginAdmin = async (email, password) => {
    try {
        const response = await axios.post(`${USER_API_URL}/login`, { email, password });
        const resData = response.data;

        if (!resData.token) throw new Error("Server không trả về Token.");

        return {
            token: resData.token,
            user: resData.data 
        };
    } catch (error) {
        const errorMessage = error.response?.data?.message || 'Lỗi kết nối Server.';
        throw new Error(errorMessage);
    }
};

export const getCurrentToken = async () => {
     try {
        const token = await AsyncStorage.getItem(STORAGE_KEY_TOKEN);
        return token;
    } catch (error) {
        return null;
    }
}

export const logoutUser = async () => {
    try {
        await AsyncStorage.multiRemove(['token', 'user']);
    } catch (e) {
        console.error('Lỗi đăng xuất:', e);
    }
};