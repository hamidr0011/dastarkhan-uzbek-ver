
import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { getAllOrders, getAllReservations } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/currency';

const ManagerDashboard = ({ navigation }) => {
    const { user, logout } = useContext(AuthContext);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [orders, setOrders] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [ordersResponse, reservationsResponse] = await Promise.all([
                getAllOrders(),
                getAllReservations(),
            ]);
            if (ordersResponse.success) {
                setOrders(ordersResponse.data);
            }
            if (reservationsResponse.success) {
                setReservations(reservationsResponse.data);
            }
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchDashboardData();
        });
        fetchDashboardData();
        return unsubscribe;
    }, [navigation]);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => ['Placed', 'Preparing'].includes(o.status)).length;
    const activeReservations = reservations.filter(r => r.status === 'Confirmed').length;
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);

    const StatCard = ({ title, value, icon, color, bgColor }) => (
        <View style={[styles.statCard, { backgroundColor: bgColor }]}>
            <Ionicons name={icon} size={24} color={color} style={styles.statIcon} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statTitle}>{title}</Text>
        </View>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.welcome}>Welcome, {user?.name}</Text>
                        <Text style={styles.appName}>Dastarkhan Manager</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => Alert.alert('Sign Out', 'Are you sure?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Sign Out', style: 'destructive', onPress: logout },
                        ])}
                        style={styles.signOutBtn}
                    >
                        <Ionicons name="log-out-outline" size={24} color={colors.white} />
                    </TouchableOpacity>
                </View>
                <Text style={styles.date}>{currentTime.toLocaleString()}</Text>
            </View>

            {loading ? (
                <View style={{ padding: 40, alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <>
                    <View style={styles.statsGrid}>
                        <StatCard
                            title="Total Orders"
                            value={totalOrders}
                            icon="cart"
                            color={colors.primary}
                            bgColor="#FFEBEB"
                        />
                        <StatCard
                            title="Pending"
                            value={pendingOrders}
                            icon="time"
                            color="#FF9800"
                            bgColor="#FFF3E0"
                        />
                        <StatCard
                            title="Reservations"
                            value={activeReservations}
                            icon="calendar"
                            color="#2196F3"
                            bgColor="#E3F2FD"
                        />
                        <StatCard
                            title="Revenue"
                            value={formatCurrency(totalRevenue)}
                            icon="cash"
                            color="#4CAF50"
                            bgColor="#E8F5E9"
                        />
                    </View>

                    <View style={styles.actionsContainer}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.actionButtons}>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Orders')}>
                                <Ionicons name="list" size={24} color={colors.white} />
                                <Text style={styles.actionBtnText}>Manage Orders</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Menu')}>
                                <Ionicons name="fast-food" size={24} color={colors.white} />
                                <Text style={styles.actionBtnText}>Menu Items</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Reservations')}>
                                <Ionicons name="calendar" size={24} color={colors.white} />
                                <Text style={styles.actionBtnText}>Reservations</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.recentContainer}>
                        <Text style={styles.sectionTitle}>Recent Orders</Text>
                        {orders.slice(0, 3).map(order => (
                            <View key={order.id} style={styles.recentRow}>
                                <View>
                                    <Text style={styles.recentId}>Order #{order.orderCode}</Text>
                                    <Text style={styles.recentCustomer}>{order.customerName}</Text>
                                </View>
                                <View style={{ alignItems: 'flex-end' }}>
                                    <Text style={styles.recentPrice}>{formatCurrency(order.total)}</Text>
                                    <Text style={styles.recentStatus}>{order.status}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 20,
        backgroundColor: colors.primary,
        paddingTop: 50,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    signOutBtn: {
        padding: 8,
    },
    signOutText: {
        color: colors.white,
        fontWeight: 'bold',
        marginLeft: 6,
        fontSize: 13,
    },

    welcome: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.8)',
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.white,
        marginBottom: 8,
    },
    date: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.7)',
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 10,
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        padding: 16,
        borderRadius: 8,
        marginBottom: 16,
        alignItems: 'center',
        elevation: 2,
    },
    statIcon: {
        marginBottom: 8,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
        textAlign: 'center',
    },
    statTitle: {
        color: colors.grey,
        fontSize: 12,
    },
    actionsContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 12,
    },
    actionButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    actionBtn: {
        backgroundColor: colors.primary,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        width: '32%',
    },
    actionBtnText: {
        color: colors.white,
        marginTop: 4,
        fontSize: 10,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    recentContainer: {
        padding: 20,
        backgroundColor: colors.white,
        marginHorizontal: 10,
        borderRadius: 8,
        marginBottom: 20,
    },
    recentRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey,
    },
    recentId: {
        fontWeight: 'bold',
        color: colors.text,
    },
    recentCustomer: {
        color: colors.grey,
        fontSize: 12,
    },
    recentPrice: {
        fontWeight: 'bold',
        color: colors.accent,
    },
    recentStatus: {
        fontSize: 12,
        color: colors.text,
    },
});

export default ManagerDashboard;
