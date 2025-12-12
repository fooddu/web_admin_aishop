import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, Lock, LogIn, Mail } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    ActivityIndicator, Alert, Keyboard, KeyboardAvoidingView, Platform,
    SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity,
    TouchableWithoutFeedback, View
} from 'react-native';
// Đảm bảo đường dẫn import đúng file service bên dưới
import { loginAdmin } from './src/services/user.service';

export default function LoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState('phuclv272@gmail.com');
    const [password, setPassword] = useState('Aa@111111');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async () => {
        Keyboard.dismiss();
        if (!email.trim() || !password.trim()) {
            Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ Email và Mật khẩu.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await loginAdmin(email, password);

            if (!response || !response.token || !response.user) {
                throw new Error('Dữ liệu phản hồi không hợp lệ.');
            }

            // LƯU STORAGE
            await AsyncStorage.multiSet([
                ['token', response.token],
                ['user', JSON.stringify(response.user)]
            ]);

            router.replace('/admin/dashboard'); 

        } catch (error) {
            console.error('Login Error:', error);
            const msg = error.message || 'Đăng nhập thất bại.';
            Alert.alert('Rất tiếc', msg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <SafeAreaView style={styles.container}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardView}>
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}><LogIn size={40} color="#fff" /></View>
                        <Text style={styles.appName}>AL-SHOP ADMIN</Text>
                        <Text style={styles.welcomeText}>Welcome back, Administrator!</Text>
                    </View>
                    <View style={styles.formContainer}>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Email Address</Text>
                            <View style={styles.inputContainer}>
                                <Mail size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="name@example.com" placeholderTextColor="#94a3b8" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" editable={!isLoading} />
                            </View>
                        </View>
                        <View style={styles.inputWrapper}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputContainer}>
                                <Lock size={20} color="#64748b" style={styles.inputIcon} />
                                <TextInput style={styles.input} placeholder="Enter password" placeholderTextColor="#94a3b8" value={password} onChangeText={setPassword} secureTextEntry={!showPassword} editable={!isLoading} />
                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                                    {showPassword ? <Eye size={20} color="#64748b" /> : <EyeOff size={20} color="#64748b" />}
                                </TouchableOpacity>
                            </View>
                        </View>
                        <TouchableOpacity style={[styles.loginBtn, isLoading && styles.disabledBtn]} onPress={handleLogin} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginBtnText}>LOGIN</Text>}
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </TouchableWithoutFeedback>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f1f5f9' },
    keyboardView: { flex: 1, justifyContent: 'center', paddingHorizontal: 24 },
    logoContainer: { alignItems: 'center', marginBottom: 40 },
    logoCircle: { width: 80, height: 80, backgroundColor: '#2563eb', borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
    appName: { fontSize: 28, fontWeight: '800', color: '#1e293b' },
    welcomeText: { fontSize: 15, color: '#64748b', marginTop: 8 },
    formContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 24, elevation: 5 },
    inputWrapper: { marginBottom: 20 },
    label: { fontSize: 13, fontWeight: '600', color: '#334155', marginBottom: 8 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 12, backgroundColor: '#f8fafc', height: 52, paddingHorizontal: 12 },
    inputIcon: { marginRight: 12 },
    input: { flex: 1, fontSize: 16, color: '#1e293b', height: '100%' },
    eyeIcon: { padding: 4 },
    loginBtn: { backgroundColor: '#2563eb', height: 52, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
    disabledBtn: { backgroundColor: '#94a3b8' },
    loginBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});