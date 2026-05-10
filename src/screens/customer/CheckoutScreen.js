import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { colors } from '../../constants/colors';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import { checkTableAvailability, placeOrder } from '../../services/api';
import { formatCurrency } from '../../utils/currency';

const CheckoutScreen = ({ navigation }) => {
    const { cartItems, getCartTotal, specialRequest, clearCart } = useContext(CartContext);
    const { user } = useContext(AuthContext);
    const { subtotal, tax, total } = getCartTotal();
    const [orderType, setOrderType] = useState('Dine In');
    const [tableNumber, setTableNumber] = useState('');
    const [guestCount, setGuestCount] = useState('2');
    const [pickupName, setPickupName] = useState(user?.name || '');
    const [pickupTime, setPickupTime] = useState('ASAP');
    const [tableStatus, setTableStatus] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('Card');
    const [cardLast4, setCardLast4] = useState('');
    const [paypalEmail, setPaypalEmail] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const paymentMethods = ['Card', 'PayPal', 'Cash at Counter'];

    const handleCheckTable = async () => {
        if (!tableNumber.trim()) {
            Alert.alert('Error', 'Please enter a table number first.');
            return;
        }

        try {
            const response = await checkTableAvailability(tableNumber.trim());
            setTableStatus(response.available ? 'available' : 'occupied');
        } catch (error) {
            console.error('Error checking table status:', error);
            Alert.alert('Error', 'Could not check table availability right now.');
        }
    };

    const validateOrder = () => {
        if (orderType === 'Dine In' && !tableNumber.trim()) {
            Alert.alert('Error', 'Please enter your table number for Dine In.');
            return false;
        }
        if (orderType === 'Dine In' && tableStatus !== 'available') {
            Alert.alert('Error', 'Please check table availability before confirming.');
            return false;
        }
        if (orderType === 'Takeaway' && !pickupName.trim()) {
            Alert.alert('Error', 'Please enter the pickup name.');
            return false;
        }
        if (paymentMethod === 'Card' && !/^\d{4}$/.test(cardLast4)) {
            Alert.alert('Error', 'Enter the last 4 digits of the card for staff verification.');
            return false;
        }
        if (paymentMethod === 'PayPal' && !paypalEmail.includes('@')) {
            Alert.alert('Error', 'Enter the PayPal email that will be used for payment.');
            return false;
        }
        return true;
    };

    const handleConfirmOrder = async () => {
        if (!validateOrder()) return;

        setIsProcessing(true);

        try {
            const orderPayload = {
                items: cartItems,
                subtotal,
                tax,
                total,
                currency: 'UZS',
                orderType,
                tableNumber: orderType === 'Dine In' ? tableNumber.trim() : null,
                guestCount: orderType === 'Dine In' ? Number(guestCount || 1) : null,
                pickupName: orderType === 'Takeaway' ? pickupName.trim() : null,
                pickupTime: orderType === 'Takeaway' ? pickupTime.trim() : null,
                paymentMethod,
                paymentStatus: paymentMethod === 'Cash at Counter' ? 'Pay at restaurant' : 'Payment pending',
                paymentReference: paymentMethod === 'Card' ? `Card ending ${cardLast4}` : paymentMethod === 'PayPal' ? paypalEmail.trim() : null,
                specialRequest
            };

            const response = await placeOrder(orderPayload);

            if (response.success) {
                Alert.alert(
                    'Order Placed Successfully!',
                    `Your order code is #${response.data.orderCode || response.data.order_code}`,
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                clearCart();
                                navigation.navigate('OrderTracking', { order: response.data });
                            }
                        }
                    ]
                );
            } else {
                Alert.alert('Error', response.error || 'Failed to place order');
            }
        } catch (error) {
            console.error('Error placing order:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    if (isProcessing) {
        return <LoadingSpinner label="Placing your order..." />;
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Type</Text>
                    <View style={styles.typeContainer}>
                        {['Dine In', 'Takeaway'].map(type => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.typeButton, orderType === type && styles.activeTypeButton]}
                                onPress={() => {
                                    setOrderType(type);
                                    setTableStatus(null);
                                }}
                            >
                                <Text style={[styles.typeText, orderType === type && styles.activeTypeText]}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {orderType === 'Dine In' && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Table Number</Text>
                        <View style={styles.tableRow}>
                            <TextInput
                                style={[styles.input, { flex: 1, marginRight: 10 }]}
                                placeholder="e.g. 3"
                                value={tableNumber}
                                onChangeText={(val) => { setTableNumber(val); setTableStatus(null); }}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity style={styles.checkBtn} onPress={handleCheckTable}>
                                <Text style={styles.checkBtnText}>Check</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.label, { marginTop: 16 }]}>Guests</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="e.g. 2"
                            value={guestCount}
                            onChangeText={setGuestCount}
                            keyboardType="numeric"
                        />
                        {tableStatus === 'available' && (
                            <View style={styles.statusBadge}>
                                <Text style={styles.availableText}>Table {tableNumber} is available</Text>
                            </View>
                        )}
                        {tableStatus === 'occupied' && (
                            <View style={[styles.statusBadge, styles.occupiedBadge]}>
                                <Text style={styles.occupiedText}>Table {tableNumber} is occupied. Please try another table.</Text>
                            </View>
                        )}
                    </View>
                )}

                {orderType === 'Takeaway' && (
                    <View style={styles.section}>
                        <Text style={styles.label}>Pickup Name</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Name for the pickup counter"
                            value={pickupName}
                            onChangeText={setPickupName}
                        />
                        <Text style={[styles.label, { marginTop: 16 }]}>Pickup Time</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="ASAP or e.g. 7:30 PM"
                            value={pickupTime}
                            onChangeText={setPickupTime}
                        />
                    </View>
                )}

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Payment Method</Text>
                    {paymentMethods.map(method => (
                        <TouchableOpacity
                            key={method}
                            style={styles.paymentOption}
                            onPress={() => setPaymentMethod(method)}
                        >
                            <View style={styles.radio}>
                                {paymentMethod === method && <View style={styles.radioInner} />}
                            </View>
                            <Text style={styles.paymentLabel}>{method}</Text>
                        </TouchableOpacity>
                    ))}
                    {paymentMethod === 'Card' && (
                        <TextInput
                            style={[styles.input, { marginTop: 12 }]}
                            placeholder="Card last 4 digits"
                            value={cardLast4}
                            onChangeText={setCardLast4}
                            keyboardType="numeric"
                            maxLength={4}
                        />
                    )}
                    {paymentMethod === 'PayPal' && (
                        <TextInput
                            style={[styles.input, { marginTop: 12 }]}
                            placeholder="PayPal email"
                            value={paypalEmail}
                            onChangeText={setPaypalEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    )}
                </View>

                <View style={styles.section}>
                    <Text style={styles.waitText}>Estimated Wait: {orderType === 'Dine In' ? '20-25' : '15-20'} minutes</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Order Summary</Text>
                    {cartItems.map(item => (
                        <View key={item.id} style={styles.itemRow}>
                            <Text style={styles.itemName}>{item.quantity}x {item.name}</Text>
                            <Text style={styles.itemPrice}>{formatCurrency(item.price * item.quantity)}</Text>
                        </View>
                    ))}

                    <View style={styles.divider} />

                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Subtotal</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(subtotal)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Service Fee</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(tax)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.totalRow]}>
                        <Text style={styles.totalLabel}>Total</Text>
                        <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
                    </View>
                </View>

                {specialRequest ? (
                    <View style={styles.section}>
                        <Text style={styles.label}>Special Request:</Text>
                        <Text style={styles.noteText}>{specialRequest}</Text>
                    </View>
                ) : null}
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmOrder}>
                    <Text style={styles.confirmButtonText}>Confirm Order</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 18,
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 8,
        elevation: 1,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        color: colors.text,
    },
    typeContainer: {
        flexDirection: 'row',
        backgroundColor: colors.lightGrey,
        borderRadius: 8,
        padding: 4,
    },
    typeButton: {
        flex: 1,
        paddingVertical: 12,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTypeButton: {
        backgroundColor: colors.primary,
    },
    typeText: {
        fontWeight: '600',
        color: colors.grey,
    },
    activeTypeText: {
        color: colors.white,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: colors.text,
    },
    input: {
        backgroundColor: colors.lightGrey,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#DDE3DE',
    },
    tableRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkBtn: {
        backgroundColor: colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
    },
    checkBtnText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    statusBadge: {
        marginTop: 10,
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#E9F8EE',
    },
    occupiedBadge: {
        backgroundColor: '#FEF0E8',
    },
    availableText: {
        color: colors.success,
        fontWeight: 'bold',
    },
    occupiedText: {
        color: colors.error,
        fontWeight: 'bold',
    },
    waitText: {
        fontWeight: 'bold',
        color: colors.accent,
        textAlign: 'center',
        fontSize: 16,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemName: {
        color: colors.text,
        flex: 1,
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
        marginTop: 4,
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
    noteText: {
        fontStyle: 'italic',
        color: colors.grey,
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey,
    },
    radio: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    radioInner: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: colors.primary,
    },
    paymentLabel: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 20,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.lightGrey,
    },
    confirmButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CheckoutScreen;
