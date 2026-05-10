
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';
import { getMenuItems, deleteMenuItem, toggleMenuItemAvailability } from '../../services/api';
import { Ionicons } from '@expo/vector-icons';
import { formatCurrency } from '../../utils/currency';

const MenuManagementScreen = ({ navigation }) => {
    const [items, setItems] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [loading, setLoading] = useState(true);

    const categories = ['All', 'Starters', 'Main Course', 'Breads', 'Desserts', 'Drinks'];

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const response = await getMenuItems();
            if (response.success) {
                setItems(response.data);
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

    const handleDeleteItem = (id) => {
        Alert.alert(
            'Delete Item',
            'Are you sure you want to delete this item?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await deleteMenuItem(id);
                            if (response.success) {
                                setItems(prev => prev.filter(i => i.id !== id));
                            } else {
                                Alert.alert('Error', response.error || 'Failed to delete item');
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Network error');
                        }
                    }
                }
            ]
        );
    };

    const handleToggleAvailability = async (id, currentAvailable) => {
        try {
            const response = await toggleMenuItemAvailability(id, !currentAvailable);
            if (response.success) {
                setItems(prev => prev.map(item =>
                    item.id === id ? { ...item, available: !currentAvailable } : item
                ));
            } else {
                Alert.alert('Error', response.error || 'Failed to update availability');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error');
        }
    };

    const filteredItems = selectedCategory === 'All'
        ? items
        : items.filter(i => i.category === selectedCategory);

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <Image source={{ uri: item.image || 'https://via.placeholder.com/80' }} style={styles.image} />
            <View style={styles.content}>
                <View style={styles.cardHeader}>
                    <Text style={styles.name}>{item.name}</Text>
                    <Text style={styles.price}>{formatCurrency(item.price)}</Text>
                </View>
                <Text style={styles.category}>{item.category}</Text>

                <View style={styles.actions}>
                    <TouchableOpacity
                        style={[styles.toggleButton, item.available ? styles.available : styles.unavailable]}
                        onPress={() => handleToggleAvailability(item.id, item.available)}
                    >
                        <Text style={styles.toggleText}>{item.available ? 'Available' : 'Unavailable'}</Text>
                    </TouchableOpacity>

                    <View style={styles.iconButtons}>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => navigation.navigate('AddEditMenuItem', { item, isEdit: true })}
                        >
                            <Ionicons name="pencil" size={20} color={colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.iconButton}
                            onPress={() => handleDeleteItem(item.id)}
                        >
                            <Ionicons name="trash" size={20} color={colors.error} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Menu Items</Text>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => navigation.navigate('AddEditMenuItem', { isEdit: false })}
                >
                    <Ionicons name="add" size={24} color={colors.white} />
                </TouchableOpacity>
            </View>

            <View style={styles.categoriesContainer}>
                <FlatList
                    data={categories}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[styles.categoryPill, selectedCategory === item && styles.activeCategoryPill]}
                            onPress={() => setSelectedCategory(item)}
                        >
                            <Text style={[styles.categoryText, selectedCategory === item && styles.activeCategoryText]}>{item}</Text>
                        </TouchableOpacity>
                    )}
                    contentContainerStyle={styles.categoryList}
                />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={filteredItems}
                    keyExtractor={item => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={{ alignItems: 'center', marginTop: 40 }}>
                            <Text style={{ color: colors.grey }}>No menu items found</Text>
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        paddingTop: 50,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.lightGrey,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    addButton: {
        backgroundColor: colors.accent,
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoriesContainer: {
        backgroundColor: colors.white,
        paddingVertical: 12,
    },
    categoryList: {
        paddingHorizontal: 16,
    },
    categoryPill: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: colors.lightGrey,
    },
    activeCategoryPill: {
        backgroundColor: colors.primary,
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
    card: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 4,
        backgroundColor: colors.lightGrey,
    },
    content: {
        flex: 1,
        marginLeft: 12,
        justifyContent: 'space-between',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        flex: 1,
    },
    price: {
        fontWeight: 'bold',
        color: colors.accent,
    },
    category: {
        color: colors.grey,
        fontSize: 12,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    toggleButton: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    available: {
        backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    unavailable: {
        backgroundColor: 'rgba(158, 158, 158, 0.1)',
    },
    toggleText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.text,
    },
    iconButtons: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: 12,
        padding: 4,
    },
});

export default MenuManagementScreen;
