
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const getStatusColor = (status) => {
    switch (status) {
        case 'Placed': return '#2196F3'; // Blue
        case 'Preparing': return '#FF9800'; // Orange
        case 'Ready': return '#4CAF50'; // Green
        case 'served': // Case insensitive check handled below? No, usually match exact.
        case 'Served': return '#9E9E9E'; // Grey
        case 'Cancelled': return '#F44336'; // Red
        case 'Confirmed': return '#4CAF50'; // Green
        case 'Completed': return '#9E9E9E'; // Grey
        default: return '#9E9E9E';
    }
};

const StatusBadge = ({ status }) => {
    const backgroundColor = getStatusColor(status);

    return (
        <View style={[styles.badge, { backgroundColor }]}>
            <Text style={styles.text}>{status}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});

export default StatusBadge;
