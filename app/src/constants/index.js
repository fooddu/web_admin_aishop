// src/constants/index.js

import { Home, List, LogOut, Settings, ShoppingBag, Users } from 'lucide-react-native';

// CẤU HÌNH API
const API_IP_ADDRESS = 'http://localhost'; 
const API_PORT = 4000; 
export const API_BASE_URL = `${API_IP_ADDRESS}:${API_PORT}/api`; 

// HẰNG SỐ MÀU SẮC (ĐÃ THÊM)
export const COLORS = {
    primary: '#FF4D80',      // Màu hồng chủ đạo
    background: '#FFFFFF',   // Màu nền trắng
    text: '#333333',         // Màu chữ đậm
    textInactive: '#6c757d', // Màu chữ mờ
    cardBackground: '#f8f9fa',
};

// CÁC MỤC MENU (Đã có trong SideBar)
export const MENU_ITEMS = [
  { name: 'Dashboard', icon: Home, path: '/admin/dashboard' },
  { name: 'Products', icon: ShoppingBag, path: '/admin/products' },
  { name: 'Orders', icon: List, path: '/admin/orders' },
  { name: 'Users', icon: Users, path: '/admin/users' },
  { name: 'Settings', icon: Settings, path: '/admin/settings' },
];

export const LOGOUT_ITEM = {
    name: 'Logout',
    icon: LogOut,
    path: '/', // Điều hướng về trang Login
};