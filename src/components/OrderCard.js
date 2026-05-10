
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import StatusBadge from './StatusBadge';
import { formatCurrency } from '../utils/currency';

const OrderCard = ({ order, onPress, showUpdateButton, onUpdateStatus }) => {
    const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={styles.header}>
                <Text style={styles.orderId}>Order #{order.orderCode || order.id}</Text>
                <StatusBadge status={order.status} />
            </View>

            <View style={styles.details}>
                <Text style={styles.customerName}>{order.customerName}</Text>
                <Text style={styles.time}>{new Date(order.timestamp).toLocaleString()}</Text>
            </View>

            <View style={styles.itemsSummary}>
                <Text style={styles.itemsText} numberOfLines={1}>
                    {order.items?.map(i => `${i.quantity}x ${i.name}`).join(', ')}
                </Text>
                <Text style={styles.itemCount}>{itemCount} items</Text>
            </View>

            <View style={styles.footer}>
                <Text style={styles.total}>Total: {formatCurrency(order.total)}</Text>
                {showUpdateButton && (
                    <TouchableOpacity style={styles.updateButton} onPress={onUpdateStatus}>
                        <Text style={styles.updateButtonText}>Update Status</Text>
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
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
        marginBottom: 8,
    },
    orderId: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.primary,
    },
    details: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    customerName: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
    },
    time: {
        fontSize: 12,
        color: colors.grey,
    },
    itemsSummary: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    itemsText: {
        fontSize: 14,
        color: colors.grey,
        flex: 1,
        marginRight: 8,
    },
    itemCount: {
        fontSize: 12,
        color: colors.grey,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: colors.lightGrey,
        paddingTop: 8,
    },
    total: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
    },
    updateButton: {
        backgroundColor: colors.accent,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
    },
    updateButtonText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: 'bold',
    },
});

export default OrderCard;
