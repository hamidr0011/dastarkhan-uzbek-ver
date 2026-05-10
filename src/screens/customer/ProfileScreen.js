
import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, TextInput, ScrollView, Modal, Platform } from 'react-native';
import { colors } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

const ProfileScreen = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(user?.name);
    const [email, setEmail] = useState(user?.email);
    const [phone, setPhone] = useState(user?.phone || '');
    const [showPasswordModal, setShowPasswordModal] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Logout', style: 'destructive', onPress: logout }
            ]
        );
    };

    const handleSaveProfile = () => {
        setIsEditing(false);
        Alert.alert('Success', 'Profile updated successfully');
    };

    const handleChangePassword = () => {
        setShowPasswordModal(false);
        Alert.alert('Success', 'Password changed successfully');
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{user?.name?.charAt(0).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.name}</Text>
                    <Text style={styles.userEmail}>{user?.email}</Text>
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Personal Details</Text>
                        <TouchableOpacity onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}>
                            <Text style={styles.editText}>{isEditing ? 'Save' : 'Edit'}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Name</Text>
                        {isEditing ? (
                            <TextInput style={styles.input} value={name} onChangeText={setName} />
                        ) : (
                            <Text style={styles.value}>{name}</Text>
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Email</Text>
                        <Text style={styles.value}>{email}</Text>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.label}>Phone</Text>
                        {isEditing ? (
                            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
                        ) : (
                            <Text style={styles.value}>{phone || 'Not set'}</Text>
                        )}
                    </View>
                </View>

                <View style={styles.section}>
                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Reservation')}>
                        <View style={styles.row}>
                            <Ionicons name="calendar-outline" size={24} color={colors.primary} />
                            <Text style={styles.actionText}>Book a Table</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.grey} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('MyReservations')}>
                        <View style={styles.row}>
                            <Ionicons name="restaurant-outline" size={24} color={colors.primary} />
                            <Text style={styles.actionText}>My Reservations</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.grey} />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionButton} onPress={() => setShowPasswordModal(true)}>
                        <View style={styles.row}>
                            <Ionicons name="lock-closed-outline" size={24} color={colors.primary} />
                            <Text style={styles.actionText}>Change Password</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={colors.grey} />
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.version}>Dastarkhan v1.0.0</Text>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={showPasswordModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Change Password</Text>
                        <TextInput style={styles.modalInput} placeholder="Current Password" secureTextEntry />
                        <TextInput style={styles.modalInput} placeholder="New Password" secureTextEntry />
                        <TextInput style={styles.modalInput} placeholder="Confirm New Password" secureTextEntry />
                        <View style={styles.modalActions}>
                            <TouchableOpacity style={styles.modalButtonCancel} onPress={() => setShowPasswordModal(false)}>
                                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.modalButtonSave} onPress={handleChangePassword}>
                                <Text style={styles.modalButtonTextSave}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        alignItems: 'center',
        padding: 30,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey,
        paddingTop: 50,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.white,
    },
    userName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
    },
    userEmail: {
        color: colors.grey,
        fontSize: 14,
    },
    section: {
        backgroundColor: colors.white,
        marginTop: 20,
        padding: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.lightGrey,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    editText: {
        color: colors.accent,
        fontWeight: 'bold',
    },
    field: {
        marginBottom: 12,
    },
    label: {
        color: colors.grey,
        fontSize: 12,
        marginBottom: 4,
    },
    value: {
        fontSize: 16,
        color: colors.text,
    },
    input: {
        fontSize: 16,
        color: colors.text,
        borderBottomWidth: 1,
        borderBottomColor: colors.accent,
        paddingVertical: 4,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionText: {
        fontSize: 16,
        marginLeft: 12,
        color: colors.text,
    },
    footer: {
        padding: 30,
        alignItems: 'center',
    },
    version: {
        color: colors.grey,
        marginBottom: 20,
    },
    logoutButton: {
        paddingVertical: 12,
        paddingHorizontal: 40,
        borderWidth: 1,
        borderColor: colors.error,
        borderRadius: 8,
    },
    logoutText: {
        color: colors.error,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 20,
        minWidth: 300,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: colors.lightGrey,
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    modalButtonCancel: {
        flex: 1,
        padding: 12,
        alignItems: 'center',
        marginRight: 8,
    },
    modalButtonSave: {
        flex: 1,
        backgroundColor: colors.primary,
        padding: 12,
        alignItems: 'center',
        borderRadius: 8,
        marginLeft: 8,
    },
    modalButtonTextCancel: {
        color: colors.text,
        fontWeight: 'bold',
    },
    modalButtonTextSave: {
        color: colors.white,
        fontWeight: 'bold',
    },
});

export default ProfileScreen;
