
import React, { useContext } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { colors } from '../../constants/colors';
import { CartContext } from '../../context/CartContext';
import CartItem from '../../components/CartItem';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/currency';

const CartScreen = ({ navigation }) => {
    const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal, specialRequest, setSpecialRequest } = useContext(CartContext);
    const { subtotal, tax, total } = getCartTotal();

    const handleCheckout = () => {
        if (cartItems.length === 0) {
            Alert.alert('Empty Cart', 'Please add items to your cart first.');
            return;
        }
        navigation.navigate('Checkout');
    };

    const handleIncrease = (id) => {
        const item = cartItems.find(i => i.id === id);
        if (item.quantity < 10) updateQuantity(id, item.quantity + 1);
    };

    const handleDecrease = (id) => {
        const item = cartItems.find(i => i.id === id);
        if (item.quantity > 1) {
            updateQuantity(id, item.quantity - 1);
        } else {
            Alert.alert(
                'Remove Item',
                'Do you want to remove this item?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(id) }
                ]
            );
        }
    };

    if (cartItems.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="cart-outline" size={80} color={colors.grey} />
                <Text style={styles.emptyText}>Your cart is empty</Text>
                <TouchableOpacity style={styles.browseButton} onPress={() => navigation.navigate('Menu')}>
                    <Text style={styles.browseButtonText}>Browse Menu</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={cartItems}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <CartItem
                        item={item}
                        onIncrease={handleIncrease}
                        onDecrease={handleDecrease}
                        onRemove={removeFromCart}
                    />
                )}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={
                    <>
                        <View style={styles.noteContainer}>
                            <Text style={styles.label}>Special Request for Order</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Any special instructions for the whole order?"
                                value={specialRequest}
                                onChangeText={setSpecialRequest}
                            />
                        </View>

                        <View style={styles.summaryContainer}>
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

                        <TouchableOpacity style={styles.clearButton} onPress={clearCart}>
                            <Text style={styles.clearButtonText}>Clear Cart</Text>
                        </TouchableOpacity>
                    </>
                }
            />

            <View style={styles.footer}>
                <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
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
    listContent: {
        padding: 20,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    emptyText: {
        fontSize: 20,
        color: colors.grey,
        marginTop: 16,
        marginBottom: 24,
    },
    browseButton: {
        backgroundColor: colors.primary,
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
    },
    browseButtonText: {
        color: colors.white,
        fontSize: 16,
        fontWeight: 'bold',
    },
    noteContainer: {
        marginBottom: 20,
    },
    label: {
        fontWeight: 'bold',
        marginBottom: 8,
        color: colors.text,
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.lightGrey,
        borderRadius: 8,
        padding: 12,
    },
    summaryContainer: {
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 16,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    summaryLabel: {
        color: colors.text,
    },
    summaryValue: {
        fontWeight: 'bold',
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
    clearButton: {
        alignItems: 'center',
        padding: 12,
    },
    clearButtonText: {
        color: colors.error,
        fontWeight: 'bold',
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
    checkoutButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    checkoutButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default CartScreen;
