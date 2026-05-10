
import React, { useState, useEffect, useContext, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';
import { getMenuItems } from '../../services/api';
import MenuItemCard from '../../components/MenuItemCard';
import { CartContext } from '../../context/CartContext';
import { Ionicons } from '@expo/vector-icons';

const MenuScreen = ({ route, navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [allItems, setAllItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useContext(CartContext);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getMenuItems();
            if (response.success) {
                setAllItems(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch menu items:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', fetchItems);
        fetchItems();
        return unsubscribe;
    }, [navigation, fetchItems]);

    // Handle category passed from Home screen
    useEffect(() => {
        if (route.params?.category) {
            setSelectedCategory(route.params.category);
        }
    }, [route.params]);

    useEffect(() => {
        let result = allItems;

        if (selectedCategory !== 'All') {
            result = result.filter(item => item.category === selectedCategory);
        }

        if (searchQuery) {
            result = result.filter(item =>
                item.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        setFilteredItems(result);
    }, [searchQuery, selectedCategory, allItems]);

    const categories = ['All', 'Starters', 'Main Course', 'Breads', 'Desserts', 'Drinks'];

    const handleAddToCart = (item) => {
        addToCart(item, 1, '');
        Alert.alert('Added to Cart', `${item.name} has been added to your cart.`);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color={colors.grey} style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search menu..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                </View>
            </View>

            <View style={styles.categoriesContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {categories.map((cat, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.categoryButton,
                                selectedCategory === cat && styles.activeCategoryButton
                            ]}
                            onPress={() => setSelectedCategory(cat)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === cat && styles.activeCategoryText
                            ]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    keyExtractor={item => item.id.toString()}
                    renderItem={({ item }) => (
                        <MenuItemCard
                            item={item}
                            onAddToCart={() => handleAddToCart(item)}
                            onPress={() => navigation.navigate('ItemDetail', { item })}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No items found</Text>
                        </View>
                    }
                />
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
        backgroundColor: colors.white,
        paddingTop: 50,
        elevation: 2,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.lightGrey,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 44,
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        height: '100%',
        fontSize: 16,
        color: colors.text,
    },
    categoriesContainer: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        backgroundColor: colors.background,
    },
    categoryButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 10,
        borderRadius: 20,
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.lightGrey,
    },
    activeCategoryButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    categoryText: {
        color: colors.text,
        fontWeight: '600',
    },
    activeCategoryText: {
        color: colors.white,
    },
    listContent: {
        padding: 20,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: colors.grey,
        fontSize: 16,
    },
});

export default MenuScreen;
