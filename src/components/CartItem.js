
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { colors } from '../constants/colors';
import { Ionicons } from '@expo/vector-icons'; // Assuming vector-icons installed
import { formatCurrency } from '../utils/currency';

const CartItem = ({ item, onIncrease, onDecrease, onRemove }) => {
    return (
        <View style={styles.container}>
            <Image source={{ uri: item.image }} style={styles.image} />

            <View style={styles.details}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <TouchableOpacity onPress={() => onRemove(item.id)}>
                        <Ionicons name="trash-outline" size={20} color={colors.error} />
                    </TouchableOpacity>
                </View>

                <Text style={styles.price}>{formatCurrency(item.price)}</Text>

                <View style={styles.controls}>
                    <View style={styles.quantityControl}>
                        <TouchableOpacity style={styles.qtyButton} onPress={() => onDecrease(item.id)}>
                            <Ionicons name="remove" size={16} color={colors.primary} />
                        </TouchableOpacity>

                        <Text style={styles.quantity}>{item.quantity}</Text>

                        <TouchableOpacity style={styles.qtyButton} onPress={() => onIncrease(item.id)}>
                            <Ionicons name="add" size={16} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.total}>{formatCurrency(item.price * item.quantity)}</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        padding: 8,
        marginBottom: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 4,
        backgroundColor: colors.lightGrey,
    },
    details: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        flex: 1,
        marginRight: 8,
    },
    price: {
        fontSize: 14,
        color: colors.grey,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightGrey,
        borderRadius: 4,
        padding: 2,
    },
    qtyButton: {
        padding: 4,
    },
    quantity: {
        paddingHorizontal: 12,
        fontWeight: 'bold',
        color: colors.text,
    },
    total: {
        fontWeight: 'bold',
        color: colors.primary,
        fontSize: 16,
    },
});

export default CartItem;
