
import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

const LoadingSpinner = ({ label }) => {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color={colors.primary} />
            {label && <Text style={styles.label}>{label}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
        flex: 1,
    },
    label: {
        marginTop: 12,
        color: colors.grey,
        fontSize: 14,
    },
});

export default LoadingSpinner;
