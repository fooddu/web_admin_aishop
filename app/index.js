// app/index.js

import { Redirect } from 'expo-router';
import React from 'react';

// Vì chúng ta đang kiểm tra giao diện Admin trước, 
// chúng ta bỏ qua việc check Auth và Redirect thẳng đến Admin Group
export default function StartScreen() {
    // Redirect thẳng đến Admin Group
    return <Redirect href="/admin" />; 
}