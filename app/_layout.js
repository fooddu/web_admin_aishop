import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      {/* KHÔNG CẦN định nghĩa Stack.Screen name="admin" riêng */}
      {/* Chỉ cần tham chiếu đến nhóm (admin) và (auth) */}
      <Stack.Screen name="(admin)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}