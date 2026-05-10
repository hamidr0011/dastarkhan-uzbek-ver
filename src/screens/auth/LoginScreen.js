
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { login, loginWithGoogleSession, isLoading } = useContext(AuthContext);

    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Simple email validation
        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        const result = await login(email, password);
        if (!result.success) {
            Alert.alert('Login Failed', result.error);
        }
    };

    const handleGoogleLogin = async () => {
        const response = await loginWithGoogleSession();
        if (!response.success) {
            Alert.alert('Google Login Failed', response.error);
        }
    };

    if (isLoading) {
        return <LoadingSpinner label="Logging in..." />;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={theme.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.appName}>Dastarkhan</Text>
                    <Text style={styles.tagline}>Authentic Uzbek Dining</Text>
                </View>

                <View style={styles.formContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={theme.input}
                        placeholder="Enter your email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        accessibilityLabel="Email Input"
                    />

                    <Text style={styles.label}>Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={[theme.input, styles.passwordInput]}
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            accessibilityLabel="Password Input"
                        />
                        <TouchableOpacity
                            style={styles.eyeIcon}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Text style={styles.eyeText}>{showPassword ? 'Hide' : 'Show'}</Text>
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity style={theme.button} onPress={handleLogin} accessibilityLabel="Login Button">
                        <Text style={theme.buttonText}>Login</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
                        <Text style={styles.googleButtonText}>Continue with Google</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.registerLink}
                        onPress={() => navigation.navigate('Register')}
                    >
                        <Text style={styles.registerText}>Don't have an account? <Text style={styles.registerBold}>Register</Text></Text>
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    appName: {
        fontSize: 36,
        fontWeight: 'bold',
        color: colors.accent,
        marginBottom: 8,
    },
    tagline: {
        fontSize: 18,
        color: colors.text,
        fontStyle: 'italic',
    },
    formContainer: {
        width: '100%',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    passwordContainer: {
        position: 'relative',
    },
    passwordInput: {
        paddingRight: 60,
    },
    eyeIcon: {
        position: 'absolute',
        right: 12,
        top: 14,
    },
    eyeText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    registerLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    googleButton: {
        marginTop: 12,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.lightGrey,
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
    },
    googleButtonText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: 'bold',
    },
    registerText: {
        color: colors.text,
        fontSize: 16,
    },
    registerBold: {
        fontWeight: 'bold',
        color: colors.primary,
    },
});

export default LoginScreen;
