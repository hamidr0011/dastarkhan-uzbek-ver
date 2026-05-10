import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { colors } from '../../constants/colors';
import StatusBadge from '../../components/StatusBadge';
import { updateOrderStatus } from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const OrderDetailScreen = ({ route, navigation }) => {
    const { order } = route.params;
    const [status, setStatus] = useState(order.status);
    const [updating, setUpdating] = useState(false);

    const handleUpdateStatus = (newStatus) => {
        Alert.alert(
            'Update Status',
            `Change status to ${newStatus}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Confirm',
                    onPress: async () => {
                        setUpdating(true);
                        try {
                            const response = await updateOrderStatus(order.id, newStatus);
                            if (response.success) {
                                setStatus(newStatus);
                                Alert.alert('Success', 'Order status updated');
                            } else {
                                Alert.alert('Error', response.error || 'Failed to update status');
                            }
                        } catch (error) {
                            console.error('Status update error:', error);
                            Alert.alert('Error', 'An unexpected error occurred');
                        } finally {
                            setUpdating(false);
                        }
                    }
                }
            ]
        );
    };

    const getNextStatusAction = () => {
        switch (status) {
            case 'Placed':
                return (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#FF9800' }]} onPress={() => handleUpdateStatus('Preparing')}>
                        <Text style={styles.actionButtonText}>Mark as Preparing</Text>
                    </TouchableOpacity>
                );
            case 'Preparing':
                return (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: '#4CAF50' }]} onPress={() => handleUpdateStatus('Ready')}>
                        <Text style={styles.actionButtonText}>Mark as Ready</Text>
                    </TouchableOpacity>
                );
            case 'Ready':
                return (
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]} onPress={() => handleUpdateStatus('Served')}>
                        <Text style={styles.actionButtonText}>Mark as Served</Text>
                    </TouchableOpacity>
                );
            case 'Served':
                return (
                    <View style={styles.completedContainer}>
                        <Text style={styles.completedText}>Order Completed</Text>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Order #{order.orderCode || order.id}</Text>
                <StatusBadge status={status} />
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer Details</Text>
                <Text style={styles.text}><Text style={styles.label}>Name: </Text>{order.customerName}</Text>
                <Text style={styles.text}><Text style={styles.label}>Type: </Text>{order.orderType}</Text>
                {order.tableNumber && (
                    <Text style={styles.text}><Text style={styles.label}>Table: </Text>{order.tableNumber}</Text>
                )}
                {order.pickupName && (
                    <Text style={styles.text}><Text style={styles.label}>Pickup: </Text>{order.pickupName} ({order.pickupTime || 'ASAP'})</Text>
                )}
                <Text style={styles.text}><Text style={styles.label}>Payment: </Text>{order.paymentMethod || 'Not selected'}</Text>
                <Text style={styles.text}><Text style={styles.label}>Time: </Text>{new Date(order.timestamp).toLocaleString()}</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Order Items</Text>
                {order.items?.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
                        <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                    </View>
                ))}
                {order.specialRequest ? (
                    <View style={styles.noteContainer}>
                        <Text style={styles.label}>Note:</Text>
                        <Text style={styles.noteText}>{order.specialRequest}</Text>
                    </View>
                ) : null}
            </View>

            <View style={styles.section}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Subtotal</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(order.subtotal)}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Service Fee</Text>
                    <Text style={styles.summaryValue}>{formatCurrency(order.tax)}</Text>
                </View>
                <View style={[styles.summaryRow, styles.totalRow]}>
                    <Text style={styles.totalLabel}>Total</Text>
                    <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                {getNextStatusAction()}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    section: {
        backgroundColor: colors.white,
        marginTop: 16,
        padding: 20,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.lightGrey,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
        color: colors.text,
    },
    text: {
        fontSize: 16,
        marginBottom: 8,
        color: colors.text,
    },
    label: {
        fontWeight: 'bold',
        color: colors.grey,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        fontSize: 16,
        color: colors.text,
    },
    itemPrice: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    noteContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.lightGrey,
    },
    noteText: {
        fontStyle: 'italic',
        color: colors.text,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        color: colors.grey,
    },
    summaryValue: {
        fontWeight: '600',
        color: colors.text,
    },
    totalRow: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: colors.lightGrey,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    totalValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.primary,
    },
    footer: {
        padding: 20,
        marginTop: 20,
        marginBottom: 40,
    },
    actionButton: {
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    actionButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    completedContainer: {
        backgroundColor: colors.lightGrey,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    completedText: {
        color: colors.grey,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default OrderDetailScreen;
