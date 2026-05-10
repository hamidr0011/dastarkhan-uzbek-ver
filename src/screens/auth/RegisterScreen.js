
import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { colors } from '../../constants/colors';
import { theme } from '../../constants/theme';
import LoadingSpinner from '../../components/LoadingSpinner';

const RegisterScreen = ({ navigation }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [role, setRole] = useState('customer'); // 'customer' or 'manager'
    const [managerCode, setManagerCode] = useState('');

    const { register, isLoading } = useContext(AuthContext);

    const handleRegister = async () => {
        if (!name || !email || !phone || !password || !confirmPassword) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        if (role === 'manager' && !managerCode.trim()) {
            Alert.alert('Error', 'Manager Access Code is required');
            return;
        }

        const emailRegex = /\S+@\S+\.\S+/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
            Alert.alert('Error', 'Password must be at least 8 characters and include uppercase, lowercase, and a number');
            return;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        const result = await register(name, email, password, phone, role, managerCode);
        if (result.success) {
            if (result.requiresEmailConfirmation) {
                Alert.alert('Success', 'Account created. Please confirm your email before logging in.', [
                    { text: 'OK', onPress: () => navigation.navigate('Login') }
                ]);
            }
            // If email confirmation is not required, user is auto-logged in. No alert needed.
        } else {
            Alert.alert('Error', result.error || 'Registration failed');
        }
    };

    if (isLoading) {
        return <LoadingSpinner label="Registering..." />;
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={theme.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <View style={styles.headerContainer}>
                    <Text style={styles.title}>Create Account</Text>
                    <Text style={styles.subtitle}>Join Dastarkhan today</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.roleContainer}>
                        <TouchableOpacity
                            style={[styles.roleButton, role === 'customer' && styles.activeRoleButton]}
                            onPress={() => setRole('customer')}
                        >
                            <Text style={[styles.roleText, role === 'customer' && styles.activeRoleText]}>Customer</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.roleButton, role === 'manager' && styles.activeRoleButton]}
                            onPress={() => setRole('manager')}
                        >
                            <Text style={[styles.roleText, role === 'manager' && styles.activeRoleText]}>Manager</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={theme.input}
                        placeholder="Enter full name"
                        value={name}
                        onChangeText={setName}
                        accessibilityLabel="Name Input"
                    />

                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={theme.input}
                        placeholder="Enter email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        accessibilityLabel="Email Input"
                    />

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        style={theme.input}
                        placeholder="Enter phone number"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        accessibilityLabel="Phone Input"
                    />

                    {role === 'manager' && (
                        <>
                            <Text style={styles.label}>Manager Access Code</Text>
                            <TextInput
                                style={theme.input}
                                placeholder="Enter secret code"
                                value={managerCode}
                                onChangeText={setManagerCode}
                                autoCapitalize="characters"
                                accessibilityLabel="Manager Code Input"
                            />
                        </>
                    )}

                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={theme.input}
                        placeholder="Min 8 chars, upper/lowercase, number"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        accessibilityLabel="Password Input"
                    />

                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        style={theme.input}
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        secureTextEntry
                        accessibilityLabel="Confirm Password Input"
                    />

                    <TouchableOpacity style={theme.button} onPress={handleRegister} accessibilityLabel="Register Button">
                        <Text style={theme.buttonText}>Register</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.loginLink}
                        onPress={() => navigation.navigate('Login')}
                    >
                        <Text style={styles.loginText}>Already have an account? <Text style={styles.loginBold}>Login</Text></Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    headerContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.primary,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: colors.grey,
    },
    formContainer: {
        width: '100%',
    },
    roleContainer: {
        flexDirection: 'row',
        backgroundColor: colors.lightGrey,
        borderRadius: 8,
        padding: 4,
        marginBottom: 20,
    },
    roleButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeRoleButton: {
        backgroundColor: colors.primary,
    },
    roleText: {
        fontWeight: 'bold',
        color: colors.grey,
    },
    activeRoleText: {
        color: colors.white,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    loginText: {
        color: colors.text,
        fontSize: 16,
    },
    loginBold: {
        fontWeight: 'bold',
        color: colors.primary,
    },
});

export default RegisterScreen;
