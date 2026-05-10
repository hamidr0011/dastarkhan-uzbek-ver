
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Switch, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator } from 'react-native';
import { colors } from '../../constants/colors';
import { Picker } from '@react-native-picker/picker';
import { addMenuItem, updateMenuItem } from '../../services/api';

const AddEditMenuItemScreen = ({ route, navigation }) => {
    const { item, isEdit } = route.params || {};

    const [name, setName] = useState(isEdit && item ? item.name : '');
    const [category, setCategory] = useState(isEdit && item ? item.category : 'Starters');
    const [description, setDescription] = useState(isEdit && item ? item.description : '');
    const [price, setPrice] = useState(isEdit && item ? item.price.toString() : '');
    const [image, setImage] = useState(isEdit && item ? item.image : '');
    const [available, setAvailable] = useState(isEdit && item ? item.available : true);
    const [isSpecial, setIsSpecial] = useState(isEdit && item ? (item.is_special || item.isSpecial) : false);
    const [saving, setSaving] = useState(false);

    const categories = ['Starters', 'Main Course', 'Breads', 'Desserts', 'Drinks'];

    const handleSave = async () => {
        if (!name || !description || !price) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const payload = {
            name,
            category,
            description,
            price: parseFloat(price),
            image: image || null,
            available,
            is_special: isSpecial,
        };

        setSaving(true);
        try {
            let response;
            if (isEdit) {
                response = await updateMenuItem(item.id, payload);
            } else {
                response = await addMenuItem(payload);
            }

            if (response.success) {
                Alert.alert(
                    'Success',
                    `Menu item ${isEdit ? 'updated' : 'added'} successfully`,
                    [{ text: 'OK', onPress: () => navigation.goBack() }]
                );
            } else {
                Alert.alert('Error', response.error || 'Failed to save menu item');
            }
        } catch (error) {
            Alert.alert('Error', 'Network error. Please check your connection.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{isEdit ? 'Edit Menu Item' : 'Add Menu Item'}</Text>
            </View>

            <View style={styles.form}>
                <Text style={styles.label}>Item Name</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="e.g. Tashkent Plov"
                />

                <Text style={styles.label}>Category</Text>
                <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={category}
                        onValueChange={(itemValue) => setCategory(itemValue)}
                        mode="dropdown"
                    >
                        {categories.map((cat) => (
                            <Picker.Item key={cat} label={cat} value={cat} />
                        ))}
                    </Picker>
                </View>

                <Text style={styles.label}>Price (UZS)</Text>
                <TextInput
                    style={styles.input}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                    placeholder="0.00"
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    placeholder="Describe the dish..."
                />

                <Text style={styles.label}>Image URL</Text>
                <TextInput
                    style={styles.input}
                    value={image}
                    onChangeText={setImage}
                    placeholder="https://..."
                />
                {image ? <Image source={{ uri: image }} style={styles.previewImage} /> : null}

                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Available</Text>
                    <Switch
                        value={available}
                        onValueChange={setAvailable}
                        trackColor={{ false: colors.lightGrey, true: colors.primary }}
                    />
                </View>

                <View style={styles.switchRow}>
                    <Text style={styles.switchLabel}>Daily Special</Text>
                    <Switch
                        value={isSpecial}
                        onValueChange={setIsSpecial}
                        trackColor={{ false: colors.lightGrey, true: colors.accent }}
                    />
                </View>

                <View style={styles.actions}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={saving}>
                        {saving ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.saveButtonText}>Save Item</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    header: {
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
    form: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    input: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.lightGrey,
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
        fontSize: 16,
    },
    pickerContainer: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.lightGrey,
        borderRadius: 8,
        marginBottom: 16,
    },
    textArea: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    previewImage: {
        width: '100%',
        height: 150,
        borderRadius: 8,
        marginBottom: 16,
        backgroundColor: colors.lightGrey,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.lightGrey,
    },
    switchLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
        marginBottom: 40,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: 14,
        marginRight: 8,
        borderWidth: 1,
        borderColor: colors.grey,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: colors.grey,
        fontWeight: 'bold',
        fontSize: 16,
    },
    saveButton: {
        flex: 1,
        paddingVertical: 14,
        marginLeft: 8,
        backgroundColor: colors.primary,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 16,
    },
});

export default AddEditMenuItemScreen;
