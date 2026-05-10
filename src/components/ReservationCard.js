
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { colors } from '../constants/colors';
import StatusBadge from './StatusBadge';

const ReservationCard = ({ reservation, onCancel, onConfirm, isManager }) => {
    const handleCancel = () => {
        Alert.alert(
            'Cancel Reservation',
            'Are you sure you want to cancel this reservation?',
            [
                { text: 'No', style: 'cancel' },
                { text: 'Yes', style: 'destructive', onPress: () => onCancel(reservation.id) },
            ]
        );
    };

    return (
        <View style={styles.card}>
            <View style={styles.header}>
                <Text style={styles.name}>{reservation.customerName}</Text>
                <StatusBadge status={reservation.status} />
            </View>

            <View style={styles.details}>
                <View style={styles.row}>
                    <Text style={styles.label}>Date:</Text>
                    <Text style={styles.value}>{reservation.date}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Time:</Text>
                    <Text style={styles.value}>{reservation.time}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Guests:</Text>
                    <Text style={styles.value}>{reservation.guests}</Text>
                </View>
                {reservation.specialRequests ? (
                    <View style={styles.row}>
                        <Text style={styles.label}>Note:</Text>
                        <Text style={styles.value}>{reservation.specialRequests}</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.actions}>
                {reservation.status === 'Confirmed' && (
                    <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                )}
                {reservation.status === 'Confirmed' && isManager && (
                    /* Manager can confirm upcoming reservations? 
                       Prompt says: "Two buttons per upcoming reservation: 'Confirm' (green) and 'Cancel' (red)".
                       But usually confirmed ones are already confirmed. 
                       Maybe "Pending" -> "Confirmed"? 
                       Prompt says "Upcoming: Confirmed reservations".
                       Maybe manager can complete them? 
                       Prompt says "Two buttons per upcoming reservation: 'Confirm' (green)..."
                       If status is 'Confirmed', maybe Confirm means complete or mark as seated?
                       Or maybe new reservations start as Pending? 
                       Prompt reservations.js data says 'Confirmed'. 
                       I'll assume 'Upcoming' includes 'Confirmed' and manager action 'Confirm' might be redundant or re-confirm or complete.
                       Wait, "ReservationManagementScreen ... buttons per upcoming reservation: 'Confirm' (green) and 'Cancel' (red)".
                       If already confirmed, showing Confirm button again is weird. 
                       I'll assume for manager flow there might be 'Pending' ones or just re-confirm.
                       I'll add the Confirm button if onConfirm is provided.
                     */
                    onConfirm && (
                        <TouchableOpacity style={styles.confirmButton} onPress={() => onConfirm(reservation.id)}>
                            <Text style={styles.confirmButtonText}>Confirm</Text>
                        </TouchableOpacity>
                    )
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    details: {
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    label: {
        width: 60,
        fontWeight: '600',
        color: colors.grey,
    },
    value: {
        flex: 1,
        color: colors.text,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 8,
    },
    cancelButton: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: colors.error,
        marginLeft: 8,
    },
    cancelButtonText: {
        color: colors.error,
        fontSize: 12,
        fontWeight: 'bold',
    },
    confirmButton: {
        backgroundColor: colors.success,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        marginLeft: 8,
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default ReservationCard;
