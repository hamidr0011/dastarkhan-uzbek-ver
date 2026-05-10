import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';
import { getAllOrders } from '../../services/api';
import OrderCard from '../../components/OrderCard';

const ManageOrdersScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('All');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const tabs = ['All', 'Placed', 'Preparing', 'Ready', 'Served'];

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await getAllOrders();
            if (response.success) {
                setOrders(response.data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchOrders();
        });

        fetchOrders();
        return unsubscribe;
    }, [navigation]);

    const filteredOrders = activeTab === 'All'
        ? orders
        : orders.filter(o => o.status === activeTab);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>All Orders</Text>
            </View>

            <View style={styles.tabsContainer}>
                <FlatList
                    data={tabs}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.tab, activeTab === item && styles.activeTab]}
                            onPress={() => setActiveTab(item)}
                        >
                            <Text style={[styles.tabText, activeTab === item && styles.activeTabText]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.tabsContent}
                />
            </View>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredOrders}
                    keyExtractor={item => item.id}
                    renderItem={({ item }) => (
                        <OrderCard
                            order={item}
                            onPress={() => navigation.navigate('OrderDetail', { order: item })}
                            showUpdateButton
                            onUpdateStatus={() => navigation.navigate('OrderDetail', { order: item })}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No orders in {activeTab}</Text>
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
    header: {
        backgroundColor: colors.white,
        padding: 20,
        paddingTop: 50,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
    },
    tabsContainer: {
        backgroundColor: colors.white,
        paddingVertical: 10,
    },
    tabsContent: {
        paddingHorizontal: 10,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: colors.lightGrey,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        color: colors.text,
        fontWeight: '600',
    },
    activeTabText: {
        color: colors.white,
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

export default ManageOrdersScreen;
