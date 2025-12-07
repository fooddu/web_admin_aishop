// app/index.tsx

import { loginAdmin } from 'app/src/services/user.service';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('phuclv272@gmail.com'); 
    const [password, setPassword] = useState('Aa@111111'); 
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Lỗi', 'Vui lòng nhập Email và Mật khẩu.');
            return;
        }

        setIsLoading(true);

        // ⭐️ DEBUG 1: Dữ liệu gửi đi ⭐️
        console.log('⚡️ [RN DEBUG] Gửi yêu cầu Đăng nhập với:', { 
            email, 
            password: password.length > 0 ? '[Mật khẩu đã nhập]' : '[Mật khẩu rỗng]' 
        });

        try {
            // ⭐️ GỌI HÀM SERVICE ĐĂNG NHẬP ADMIN ⭐️
            const response = await loginAdmin(email, password);
            
            const { token, user } = response;
            
            // ⭐️ DEBUG 2: Phản hồi thành công ⭐️
            console.log('✅ [RN DEBUG] Đăng nhập THÀNH CÔNG.');
            console.log('✅ [RN DEBUG] User Name:', user.name);
            console.log('✅ [RN DEBUG] Token (một phần):', token.substring(0, 15) + '...');
            
            Alert.alert('Thành công', `Chào mừng Admin: ${user.name}!`);
            
            router.replace('/admin/');

        } catch (error) {
            // ⭐️ DEBUG 3: Xử lý lỗi từ API ⭐️
            const errorMessage = error.message || 'Lỗi không xác định.';
            console.error('❌ [RN DEBUG] LỖI Đăng nhập Client:', errorMessage);
            console.error('❌ [RN DEBUG] Chi tiết lỗi:', error); // Log toàn bộ đối tượng lỗi
            
            Alert.alert('Lỗi Đăng nhập', errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        // ... (Không thay đổi phần UI)
        <SafeAreaView style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Admin Shop AI</Text>
                <Text style={styles.subtitle}>Vui lòng đăng nhập để tiếp tục</Text>
                
                {/* Form Đăng nhập */}
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    placeholderTextColor="#999"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    editable={!isLoading} 
                />
                <TextInput
                    style={styles.input}
                    placeholder="Mật khẩu"
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={!isLoading} 
                />

                <View style={styles.buttonContainer}>
                    {isLoading ? (
                        <ActivityIndicator size="large" color="#5B7C99" />
                    ) : (
                        <Button title="ĐĂNG NHẬP" color="#5B7C99" onPress={handleLogin} />
                    )}
                </View>
                
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    // ... (Styles không thay đổi)
    container: {
        flex: 1,
        backgroundColor: '#334455',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '90%',
        maxWidth: 400,
        padding: 30,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 8,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
        textAlign: 'center',
        color: '#333',
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        marginBottom: 25,
    },
    input: {
        height: 45,
        borderColor: '#ddd',
        borderWidth: 1,
        borderRadius: 6,
        paddingHorizontal: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    buttonContainer: {
        marginTop: 10,
    }
});