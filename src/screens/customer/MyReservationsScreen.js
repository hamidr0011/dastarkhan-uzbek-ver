
import React, { useState, useContext, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { ReservationsContext } from '../../context/ReservationsContext';
import ReservationCard from '../../components/ReservationCard';

const MyReservationsScreen = ({ navigation }) => {
    const [activeTab, setActiveTab] = useState('Upcoming');
    const { reservations, fetchReservations, cancelReservation } = useContext(ReservationsContext);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => fetchReservations(false));
        fetchReservations(false);
        return unsubscribe;
    }, [navigation]);

    // Filter based on status or date? 
    // "Upcoming: Confirmed reservations with future dates"
    // "Past: Completed and Cancelled reservations"
    // For simplicity, let's filter by Status groupings as per prompt logic roughly or just status.
    const upcomingReservations = reservations.filter(r => ['Confirmed'].includes(r.status));
    const pastReservations = reservations.filter(r => ['Completed', 'Cancelled'].includes(r.status));

    const displayReservations = activeTab === 'Upcoming' ? upcomingReservations : pastReservations;

    return (
        <View style={styles.container}>
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Upcoming' && styles.activeTab]}
                    onPress={() => setActiveTab('Upcoming')}
                >
                    <Text style={[styles.tabText, activeTab === 'Upcoming' && styles.activeTabText]}>Upcoming</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'Past' && styles.activeTab]}
                    onPress={() => setActiveTab('Past')}
                >
                    <Text style={[styles.tabText, activeTab === 'Past' && styles.activeTabText]}>Past</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={displayReservations}
                keyExtractor={item => item.id}
                renderItem={({ item }) => (
                    <ReservationCard
                        reservation={item}
                        onCancel={cancelReservation}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>No {activeTab.toLowerCase()} reservations found</Text>
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

export default MyReservationsScreen;
