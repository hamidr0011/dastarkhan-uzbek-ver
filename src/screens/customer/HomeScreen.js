
import React, { useContext, useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';
import { getMenuItems, getSpecials } from '../../services/api';
import { AuthContext } from '../../context/AuthContext';
import { CartContext } from '../../context/CartContext';
import MenuItemCard from '../../components/MenuItemCard';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/currency';

const HomeScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const { addToCart } = useContext(CartContext);
    const [allItems, setAllItems] = useState([]);
    const [dailySpecials, setDailySpecials] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const [menuRes, specialsRes] = await Promise.all([
                getMenuItems(),
                getSpecials(),
            ]);
            if (menuRes.success) setAllItems(menuRes.data);
            if (specialsRes.success) setDailySpecials(specialsRes.data);
        } catch (error) {
            console.error('Failed to fetch menu data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchData);
        fetchData();
        return unsubscribe;
    }, [navigation, fetchData]);

    const categories = ['All', 'Starters', 'Main Course', 'Breads', 'Desserts', 'Drinks'];

    const handleAddToCart = (item) => {
        addToCart(item, 1, '');
        Alert.alert('Added to Cart', `${item.name} has been added to your cart.`);
    };

    const renderSpecialItem = ({ item }) => (
        <TouchableOpacity
            style={styles.specialCard}
            onPress={() => navigation.navigate('ItemDetail', { item })}
            activeOpacity={0.8}
        >
            <Image source={{ uri: item.image || 'https://via.placeholder.com/300x200' }} style={styles.specialImage} />
            <View style={styles.specialContent}>
                <Text style={styles.specialName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.specialPrice}>{formatCurrency(item.price)}</Text>
                <TouchableOpacity
                    style={styles.specialAddButton}
                    onPress={() => handleAddToCart(item)}
                >
                    <Text style={styles.specialAddText}>Add</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Salom,</Text>
                    <Text style={styles.userName}>{user?.name}!</Text>
                </View>
                <Text style={styles.date}>{new Date().toDateString()}</Text>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <ScrollView showsVerticalScrollIndicator={false}>
                    {dailySpecials.length > 0 && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Daily Specials</Text>
                            <FlatList
                                data={dailySpecials}
                                renderItem={renderSpecialItem}
                                keyExtractor={item => item.id.toString()}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={styles.specialsList}
                            />
                        </View>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Categories</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesList}>
                            {categories.map((cat, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.categoryButton}
                                    onPress={() => navigation.navigate('Menu', { category: cat })}
                                >
                                    <Text style={styles.categoryText}>{cat}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Popular Items</Text>
                        {allItems.map(item => (
                            <MenuItemCard
                                key={item.id.toString()}
                                item={item}
                                onAddToCart={() => handleAddToCart(item)}
                                onPress={() => navigation.navigate('ItemDetail', { item })}
                            />
                        ))}
                        {allItems.length === 0 && (
                            <Text style={{ color: colors.grey, textAlign: 'center', marginTop: 20 }}>No menu items available</Text>
                        )}
                    </View>
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
        padding: 20,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 50, // Status bar padding
    },
    greeting: {
        color: colors.white,
        fontSize: 16,
    },
    userName: {
        color: colors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    date: {
        color: colors.white,
        fontSize: 12,
    },
    section: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 16,
    },
    specialsList: {
        paddingRight: 20,
    },
    specialCard: {
        width: 200,
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        marginRight: 16,
        overflow: 'hidden',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    specialImage: {
        width: '100%',
        height: 120,
    },
    specialContent: {
        padding: 12,
    },
    specialName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 4,
    },
    specialPrice: {
        fontSize: 14,
        color: colors.accent,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    specialAddButton: {
        backgroundColor: colors.primary,
        paddingVertical: 6,
        borderRadius: 4,
        alignItems: 'center',
    },
    specialAddText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 12,
    },
    categoriesList: {
        flexDirection: 'row',
        marginBottom: 8,
    },
    categoryButton: {
        backgroundColor: colors.white,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 12,
        borderWidth: 1,
        borderColor: colors.lightGrey,
        elevation: 1,
    },
    categoryText: {
        color: colors.text,
        fontWeight: '600',
    },
});

export default HomeScreen;
