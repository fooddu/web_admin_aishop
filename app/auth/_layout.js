// app/_layout.js

import { Stack } from 'expo-router';
import React from 'react';
// Nếu bạn có AuthContext, bạn cần import nó và dùng để check trạng thái user
// import { AuthProvider } from '../src/contexts/AuthContext'; 

export default function RootLayout() {
  // --- Giả lập trạng thái người dùng (Để hiển thị Admin Dashboard ngay) ---
  // Trong dự án thật, bạn sẽ dùng AuthContext để kiểm tra user và role.
  const userIsLoggedIn = true; // GIẢ LẬP ĐÃ ĐĂNG NHẬP
  const userRole = 'admin';    // GIẢ LẬP LÀ ADMIN
  // ---------------------------------------------------------------------

  // Nếu người dùng đã đăng nhập và là admin, chuyển hướng đến nhóm (admin).
  // Nếu chưa đăng nhập, chuyển hướng đến nhóm (auth).

  // Trong thực tế, bạn sẽ dùng AuthProvider ở đây:
  // return (
  //   <AuthProvider>
  //     <RootNavigationStack />
  //   </AuthProvider>
  // );

  return <RootNavigationStack userIsLoggedIn={userIsLoggedIn} userRole={userRole} />;
}

// Component Stack chính (Sử dụng các nhóm định tuyến)
const RootNavigationStack = ({ userIsLoggedIn, userRole }) => {
    return (
        <Stack>
            {/* 1. Nếu chưa có logic phức tạp, màn hình khởi đầu là index */}
            <Stack.Screen name="index" options={{ headerShown: false }} />

            {/* 2. Nhóm Admin: Chứa các màn hình quản trị */}
            <Stack.Screen name="(admin)" options={{ headerShown: false }} />

            {/* 3. Nhóm Auth: Chứa Login/Register */}
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        </Stack>
    );
}