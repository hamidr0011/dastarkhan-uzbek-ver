
import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/currency';

const MenuItemCard = ({ item, onAddToCart, onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.card, !item.available && styles.disabledCard]}
            onPress={item.available ? onPress : null}
            activeOpacity={0.7}
        >
            <Image source={{ uri: item.image || 'https://via.placeholder.com/300x200' }} style={styles.image} />
            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                </View>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.description} numberOfLines={2}>{item.description}</Text>

                {item.available ? (
                    <TouchableOpacity style={styles.addButton} onPress={onAddToCart}>
                        <Text style={styles.addButtonText}>Add to Cart</Text>
                    </TouchableOpacity>
                ) : (
                    <View style={styles.unavailableBadge}>
                        <Text style={styles.unavailableText}>Not Available</Text>
                    </View>
                )}
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        marginBottom: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    disabledCard: {
        opacity: 0.6,
    },
    image: {
        width: '100%',
        height: 150,
        resizeMode: 'cover',
    },
    content: {
        padding: 12,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
        flex: 1,
        marginRight: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.accent,
    },
    category: {
        fontSize: 12,
        color: colors.grey,
        backgroundColor: colors.lightGrey,
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        marginBottom: 8,
    },
    description: {
        fontSize: 14,
        color: colors.text,
        marginBottom: 12,
        lineHeight: 20,
    },
    addButton: {
        backgroundColor: colors.primary,
        paddingVertical: 8,
        borderRadius: 4,
        alignItems: 'center',
    },
    addButtonText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    unavailableBadge: {
        backgroundColor: colors.lightGrey,
        paddingVertical: 8,
        borderRadius: 4,
        alignItems: 'center',
    },
    unavailableText: {
        color: colors.grey,
        fontWeight: 'bold',
    },
});

export default MenuItemCard;
