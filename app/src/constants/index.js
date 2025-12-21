// src/constants/index.js

// 1. Thêm 'Star' vào dòng import để làm icon cho Review
import { Home, Layers, List, LogOut, Settings, ShoppingBag, Star, Users } from 'lucide-react-native';

// CẤU HÌNH API
// ⚠️ LƯU Ý: Nếu chạy trên điện thoại thật, hãy thay 'localhost' bằng IP máy tính (VD: 192.168.1.5)
const API_IP_ADDRESS = 'http://localhost'; 
const API_PORT = 5000; 
export const API_BASE_URL = `${API_IP_ADDRESS}:${API_PORT}/api`; 

// HẰNG SỐ MÀU SẮC
export const COLORS = {
    primary: '#FF4D80',      // Màu hồng chủ đạo
    background: '#FFFFFF',   // Màu nền trắng
    text: '#333333',         // Màu chữ đậm
    textInactive: '#6c757d', // Màu chữ mờ
    cardBackground: '#f8f9fa',
    border: '#EEEEEE',
    danger: '#dc3545',
};

// CÁC MỤC MENU
export const MENU_ITEMS = [
  { name: 'Dashboard', icon: Home, path: '/admin/dashboard' },
  { name: 'Categories', icon: Layers, path: '/admin/categories' }, 
  { name: 'Products', icon: ShoppingBag, path: '/admin/products' },
  { name: 'Orders', icon: List, path: '/admin/orders' },
  
  // --- MỚI: Thêm Review vào đây ---
  { name: 'Reviews', icon: Star, path: '/admin/comments' },
  // --------------------------------
  
  { name: 'Users', icon: Users, path: '/admin/users' },
  { name: 'Settings', icon: Settings, path: '/admin/settings' },
];

export const LOGOUT_ITEM = {
    name: 'Logout',
    icon: LogOut,
    path: '/', 
};