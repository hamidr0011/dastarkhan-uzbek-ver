
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { colors } from '../../constants/colors';
import { CartContext } from '../../context/CartContext';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/currency';

const ItemDetailScreen = ({ route, navigation }) => {
    const { item } = route.params;
    const { addToCart } = useContext(CartContext);
    const [quantity, setQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState('');

    const handleIncrease = () => {
        if (quantity < 10) setQuantity(quantity + 1);
    };

    const handleDecrease = () => {
        if (quantity > 1) setQuantity(quantity - 1);
    };

    const handleAddToCart = () => {
        addToCart(item, quantity, specialInstructions);
        Alert.alert('Added to Cart', `${item.name} x${quantity} has been added to your cart.`, [
            { text: 'OK', onPress: () => navigation.goBack() }
        ]);
    };

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.imageContainer}>
                    <Image source={{ uri: item.image || 'https://via.placeholder.com/300x200' }} style={styles.image} />
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                        <Ionicons name="arrow-back" size={24} color={colors.white} />
                    </TouchableOpacity>
                </View>

                <View style={styles.content}>
                    <View style={styles.header}>
                        <Text style={styles.name}>{item.name}</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>{item.category}</Text>
                        </View>
                    </View>

                    <Text style={styles.price}>{formatCurrency(item.price)}</Text>

                    <Text style={styles.description}>{item.description}</Text>

                    <View style={styles.infoSection}>
                        <Text style={styles.infoTitle}>Ingredients / Allergens</Text>
                        <Text style={styles.infoText}>
                            Contains spices, dairy, and possibly nuts. Please inform us if you have allergies.
                        </Text>
                    </View>

                    <View style={styles.controls}>
                        <Text style={styles.label}>Quantity</Text>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity style={styles.qtyButton} onPress={handleDecrease}>
                                <Ionicons name="remove" size={24} color={colors.primary} />
                            </TouchableOpacity>
                            <Text style={styles.quantity}>{quantity}</Text>
                            <TouchableOpacity style={styles.qtyButton} onPress={handleIncrease}>
                                <Ionicons name="add" size={24} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.inputSection}>
                        <Text style={styles.label}>Special Instructions</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Any special requests? (e.g. extra spicy, no onion)"
                            value={specialInstructions}
                            onChangeText={setSpecialInstructions}
                            multiline
                        />
                    </View>
                </View>
            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.addButton} onPress={handleAddToCart}>
                    <Text style={styles.addButtonText}>Add to Cart - {formatCurrency(item.price * quantity)}</Text>
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
        paddingBottom: 80,
    },
    imageContainer: {
        position: 'relative',
    },
    image: {
        width: '100%',
        height: 250,
    },
    backButton: {
        position: 'absolute',
        top: 40,
        left: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        padding: 8,
        borderRadius: 20,
    },
    content: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
        flex: 1,
        marginRight: 10,
    },
    badge: {
        backgroundColor: colors.lightGrey,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    badgeText: {
        color: colors.text,
        fontSize: 12,
        fontWeight: '600',
    },
    price: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.accent,
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: colors.text,
        lineHeight: 24,
        marginBottom: 20,
    },
    infoSection: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 8,
        marginBottom: 20,
    },
    infoTitle: {
        fontWeight: 'bold',
        marginBottom: 4,
    },
    infoText: {
        color: colors.grey,
        fontSize: 14,
    },
    controls: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.lightGrey,
    },
    qtyButton: {
        padding: 12,
    },
    quantity: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 20,
    },
    inputSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
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
        minHeight: 80,
        textAlignVertical: 'top',
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
    addButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    addButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ItemDetailScreen;
