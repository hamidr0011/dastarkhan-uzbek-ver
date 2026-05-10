
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';
import { ReservationsContext } from '../../context/ReservationsContext';
import ReservationCard from '../../components/ReservationCard';

const ReservationManagementScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('All');
    const { reservations, loading, fetchReservations, cancelReservation, confirmReservation } = useContext(ReservationsContext);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => fetchReservations(true));
        fetchReservations(true);
        return unsubscribe;
    }, [navigation]);

    const filterReservations = () => {
        switch (activeTab) {
            case 'Upcoming':
                return reservations.filter(r => ['Confirmed'].includes(r.status));
            case 'Completed':
                return reservations.filter(r => r.status === 'Completed');
            case 'Cancelled':
                return reservations.filter(r => r.status === 'Cancelled');
            default:
                return reservations;
        }
    };

    const filteredReservations = filterReservations();

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>All Reservations</Text>
            </View>

            <View style={styles.tabsContainer}>
                <FlatList
                    data={['All', 'Upcoming', 'Completed', 'Cancelled']}
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

            <FlatList
                data={filteredReservations}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <ReservationCard
                        reservation={item}
                        isManager={true}
                        onCancel={(id) => {
                            Alert.alert(
                                'Cancel Reservation',
                                'Are you sure?',
                                [
                                    { text: 'No', style: 'cancel' },
                                    { text: 'Yes', style: 'destructive', onPress: () => cancelReservation(id) }
                                ]
                            );
                        }}
                        onConfirm={(id) => {
                            // Confirm action logic (maybe complete or re-confirm)
                            confirmReservation(id);
                            Alert.alert('Confirmed', 'Reservation status updated.');
                        }}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No reservations found in {activeTab}</Text>
                    </View>
                }
            />
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
        color: colors.primary,
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

export default ReservationManagementScreen;
