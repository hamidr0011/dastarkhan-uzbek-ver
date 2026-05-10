import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';
import { getMyOrders } from '../../services/api';
import OrderCard from '../../components/OrderCard';

const MyOrdersScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Active');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const response = await getMyOrders();
                if (response.success) {
                    setOrders(response.data);
                }
            } catch (error) {
                console.error('Error fetching orders:', error);
            } finally {
                setLoading(false);
            }
        };

        const unsubscribe = navigation.addListener('focus', () => {
            fetchOrders();
        });

        fetchOrders();
        return unsubscribe;
    }, [navigation]);

    const activeOrders = orders.filter(o => ['Placed', 'Preparing', 'Ready'].includes(o.status));
    const pastOrders = orders.filter(o => ['Served', 'Cancelled'].includes(o.status));

    const displayOrders = activeTab === 'Active' ? activeOrders : pastOrders;

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Active' && styles.activeTab]}
                    onPress={() => setActiveTab('Active')}
                >
                    <Text style={[styles.tabText, activeTab === 'Active' && styles.activeTabText]}>Active Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'History' && styles.activeTab]}
                    onPress={() => setActiveTab('History')}
                >
                    <Text style={[styles.tabText, activeTab === 'History' && styles.activeTabText]}>Order History</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={displayOrders}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <OrderCard
                            order={item}
                            onPress={() => navigation.navigate('OrderTracking', { order: item })}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} orders found</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        paddingVertical: 10,
        paddingHorizontal: 20,
        elevation: 2,
        marginTop: 40,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: colors.primary,
    },
    tabText: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.grey,
    },
    activeTabText: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 20,
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.grey,
        fontSize: 16,
    },
});

export default MyOrdersScreen;
