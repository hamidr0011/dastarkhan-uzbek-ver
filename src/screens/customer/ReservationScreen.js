
import React, { useState, useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Platform } from 'react-native';
import { colors } from '../../constants/colors';
import { AuthContext } from '../../context/AuthContext';
import { ReservationsContext } from '../../context/ReservationsContext';
import LoadingSpinner from '../../components/LoadingSpinner';
import DateTimePicker from '@react-native-community/datetimepicker';

const ReservationScreen = ({ navigation }) => {
    const { user } = useContext(AuthContext);
    const { addReservation } = useContext(ReservationsContext);

    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [time, setTime] = useState('7:00 PM');
    const [guests, setGuests] = useState(2);
    const [specialRequests, setSpecialRequests] = useState('');
    const [isChecking, setIsChecking] = useState(false);
    const [isAvailable, setIsAvailable] = useState(false);

    // Simple time slots
    const timeSlots = [
        '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
        '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
    ];

    const handleCheckAvailability = () => {
        setIsChecking(true);
        // Simulate API check
        setTimeout(() => {
            setIsChecking(false);
            setIsAvailable(true);
        }, 1000);
    };

    const handleConfirmReservation = async () => {
        const newReservation = {
            customerId: user.id,
            customerName: user.name,
            date: date.toISOString().slice(0, 10),
            time,
            guests,
            status: 'Confirmed',
            specialRequests
        };

        const response = await addReservation(newReservation);
        if (!response.success) {
            Alert.alert('Reservation Failed', response.error);
            return;
        }

        Alert.alert(
            'Reservation Confirmed!',
            `Table for ${guests} on ${date.toDateString()} at ${time} has been booked.`,
            [
                { text: 'OK', onPress: () => navigation.navigate('MyReservations') }
            ]
        );
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        setDate(currentDate);
        setIsAvailable(false); // Reset availability on change
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <View style={styles.infoCard}>
                <Text style={styles.restaurantName}>Dastarkhan Restaurant</Text>
                <Text style={styles.restaurantInfo}>Open 12 PM to 12 AM</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Select Date</Text>
                <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.dateText}>{date.toDateString()}</Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onDateChange}
                        minimumDate={new Date()}
                    />
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Select Time</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeList}>
                    {timeSlots.map(slot => (
                        <TouchableOpacity
                            key={slot}
                            style={[styles.timeSlot, time === slot && styles.activeTimeSlot]}
                            onPress={() => {
                                setTime(slot);
                                setIsAvailable(false);
                            }}
                        >
                            <Text style={[styles.timeText, time === slot && styles.activeTimeText]}>{slot}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Number of Guests</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.guestList}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                        <TouchableOpacity
                            key={num}
                            style={[styles.guestButton, guests === num && styles.activeGuestButton]}
                            onPress={() => {
                                setGuests(num);
                                setIsAvailable(false);
                            }}
                        >
                            <Text style={[styles.guestText, guests === num && styles.activeGuestText]}>{num}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <View style={styles.section}>
                <Text style={styles.label}>Special Requests</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Any special arrangements?"
                    value={specialRequests}
                    onChangeText={setSpecialRequests}
                    multiline
                />
            </View>

            {isChecking ? (
                <LoadingSpinner label="Checking availability..." />
            ) : (
                !isAvailable && (
                    <TouchableOpacity style={styles.checkButton} onPress={handleCheckAvailability}>
                        <Text style={styles.checkButtonText}>Check Availability</Text>
                    </TouchableOpacity>
                )
            )}

            {isAvailable && (
                <View style={styles.availableContainer}>
                    <Text style={styles.availableText}>Table Available! ✅</Text>
                    <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmReservation}>
                        <Text style={styles.confirmButtonText}>Confirm Reservation</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    infoCard: {
        backgroundColor: colors.white,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: 20,
        elevation: 2,
    },
    restaurantName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.primary,
    },
    restaurantInfo: {
        color: colors.grey,
        marginTop: 4,
    },
    section: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: 8,
    },
    dateButton: {
        backgroundColor: colors.white,
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: colors.lightGrey,
    },
    dateText: {
        fontSize: 16,
        color: colors.text,
    },
    timeList: {
        flexDirection: 'row',
    },
    timeSlot: {
        backgroundColor: colors.white,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 20,
        marginRight: 8,
        borderWidth: 1,
        borderColor: colors.lightGrey,
    },
    activeTimeSlot: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    timeText: {
        color: colors.text,
    },
    activeTimeText: {
        color: colors.white,
        fontWeight: 'bold',
    },
    guestList: {
        flexDirection: 'row',
    },
    guestButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
        borderWidth: 1,
        borderColor: colors.lightGrey,
    },
    activeGuestButton: {
        backgroundColor: colors.primary,
        borderColor: colors.primary,
    },
    guestText: {
        fontSize: 16,
    },
    activeGuestText: {
        color: colors.white,
        fontWeight: 'bold',
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
    checkButton: {
        backgroundColor: colors.accent,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    checkButtonText: {
        color: colors.text,
        fontSize: 18,
        fontWeight: 'bold',
    },
    availableContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    availableText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.success,
        marginBottom: 16,
    },
    confirmButton: {
        backgroundColor: colors.success,
        paddingVertical: 16,
        borderRadius: 8,
        alignItems: 'center',
        width: '100%',
    },
    confirmButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
});

export default ReservationScreen;
