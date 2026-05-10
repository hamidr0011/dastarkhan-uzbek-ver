import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';
import StatusBadge from '../../components/StatusBadge';
import { cancelOrder } from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const OrderTrackingScreen = ({ route, navigation }) => {
    const { order } = route.params;
    const [currentStatus, setCurrentStatus] = useState(order.status);
    const [timeLeft, setTimeLeft] = useState(20);
    const [cancelling, setCancelling] = useState(false);

    // Status progression simulation
    useEffect(() => {
        // Only simulate if status is not already served/cancelled
        if (['Serve', 'Served', 'Cancelled'].includes(currentStatus)) return;

        const interval = setInterval(() => {
            setCurrentStatus(prev => {
                if (prev === 'Placed') return 'Preparing';
                if (prev === 'Preparing') return 'Ready';
                if (prev === 'Ready') return 'Served';
                return prev;
            });

            setTimeLeft(prev => Math.max(0, prev - 5));
        }, 8000); // 8 seconds per step

        return () => clearInterval(interval);
    }, [currentStatus]);

    const steps = ['Placed', 'Preparing', 'Ready', 'Served'];
    const currentStepIndex = steps.indexOf(currentStatus);

    const handleCancelOrder = () => {
        Alert.alert(
            'Cancel Order',
            'Are you sure you want to cancel this order?',
            [
                { text: 'No', style: 'cancel' },
                {
                    text: 'Yes, Cancel',
                    style: 'destructive',
                    onPress: async () => {
                        setCancelling(true);
                        try {
                            const response = await cancelOrder(order.id);
                            if (response.success) {
                                setCurrentStatus('Cancelled');
                                Alert.alert('Success', 'Order Cancelled');
                                navigation.goBack();
                            } else {
                                Alert.alert('Error', response.error || 'Failed to cancel order');
                            }
                        } catch (error) {
                            console.error('Cancel order error:', error);
                            Alert.alert('Error', 'An unexpected error occurred');
                        } finally {
                            setCancelling(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.header}>
                <Text style={styles.title}>Track Order #{order.orderCode || order.id}</Text>
                <StatusBadge status={currentStatus} />
            </View>

            <View style={styles.trackerContainer}>
                <View style={styles.stepsLine} />
                <View style={styles.stepsContainer}>
                    {steps.map((step, index) => {
                        const isCompleted = index <= currentStepIndex;
                        const isCurrent = index === currentStepIndex;

                        return (
                            <View key={step} style={styles.stepWrapper}>
                                <View style={[
                                    styles.stepCircle,
                                    isCompleted && styles.stepCompleted,
                                    isCurrent && styles.stepCurrent
                                ]}>
                                    {isCompleted && <Ionicons name="checkmark" size={12} color={colors.white} />}
                                </View>
                                <Text style={[
                                    styles.stepLabel,
                                    isCompleted && styles.stepLabelCompleted,
                                    isCurrent && styles.stepLabelCurrent
                                ]}>{step}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>

            <Text style={styles.estimate}>
                Estimated Time Remaining: {currentStatus === 'Served' ? '0' : timeLeft} minutes
            </Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Order Details</Text>
                {order.items?.map((item, idx) => (
                    <View key={idx} style={styles.itemRow}>
                        <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
                        <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                    </View>
                ))}
                <View style={styles.divider} />
                <View style={styles.row}>
                    <Text style={styles.label}>Total</Text>
                    <Text style={styles.value}>{formatCurrency(order.total)}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.label}>Type</Text>
                    <Text style={styles.value}>{order.orderType}</Text>
                </View>
                {order.tableNumber && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Table</Text>
                        <Text style={styles.value}>{order.tableNumber}</Text>
                    </View>
                )}
                {order.pickupName && (
                    <View style={styles.row}>
                        <Text style={styles.label}>Pickup</Text>
                        <Text style={styles.value}>{order.pickupName} ({order.pickupTime || 'ASAP'})</Text>
                    </View>
                )}
                <View style={styles.row}>
                    <Text style={styles.label}>Payment</Text>
                    <Text style={styles.value}>{order.paymentMethod || 'Not selected'}</Text>
                </View>
            </View>

            {currentStatus === 'Placed' && (
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelOrder}>
                    <Text style={styles.cancelButtonText}>Cancel Order</Text>
                </TouchableOpacity>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 30,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    trackerContainer: {
        marginBottom: 30,
        alignItems: 'center',
    },
    stepsLine: {
        position: 'absolute',
        top: 12,
        left: 20,
        right: 20,
        height: 2,
        backgroundColor: colors.lightGrey,
    },
    stepsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    stepWrapper: {
        alignItems: 'center',
        width: 70,
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.lightGrey,
        marginBottom: 8,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1,
    },
    stepCompleted: {
        backgroundColor: colors.primary,
    },
    stepCurrent: {
        backgroundColor: colors.accent,
        transform: [{ scale: 1.2 }],
    },
    stepLabel: {
        fontSize: 10,
        color: colors.grey,
        textAlign: 'center',
    },
    stepLabelCompleted: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    stepLabelCurrent: {
        color: colors.accent,
        fontWeight: 'bold',
    },
    estimate: {
        textAlign: 'center',
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.grey,
        marginBottom: 20,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: colors.text,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        color: colors.text,
    },
    itemPrice: {
        color: colors.text,
        fontWeight: '600',
    },
    divider: {
        height: 1,
        backgroundColor: colors.lightGrey,
        marginVertical: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    label: {
        color: colors.grey,
    },
    value: {
        fontWeight: 'bold',
        color: colors.text,
    },
    cancelButton: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.error,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: colors.error,
        fontWeight: 'bold',
    },
});

export default OrderTrackingScreen;
