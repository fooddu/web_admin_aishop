// app/admin/index.js
import { Redirect } from 'expo-router';
import React from 'react';

// Chuyển hướng người dùng từ /admin sang /admin/dashboard
const AdminHomeRedirect = () => {
    return <Redirect href="/admin/dashboard" />;
};

export default AdminHomeRedirect;