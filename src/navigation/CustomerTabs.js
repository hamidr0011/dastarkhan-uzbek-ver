
import React, { useContext } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { CartContext } from '../context/CartContext';

// Screens
import HomeScreen from '../screens/customer/HomeScreen';
import MenuScreen from '../screens/customer/MenuScreen';
import ItemDetailScreen from '../screens/customer/ItemDetailScreen';
import CartScreen from '../screens/customer/CartScreen';
import CheckoutScreen from '../screens/customer/CheckoutScreen';
import OrderTrackingScreen from '../screens/customer/OrderTrackingScreen';
import MyOrdersScreen from '../screens/customer/MyOrdersScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import ReservationScreen from '../screens/customer/ReservationScreen';
import MyReservationsScreen from '../screens/customer/MyReservationsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Menu to Detail
const MenuStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MenuMain" component={MenuScreen} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
    </Stack.Navigator>
);

// Stack for Home to Detail
const HomeStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="HomeMain" component={HomeScreen} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} />
    </Stack.Navigator>
);

// Stack for Cart to Checkout to Tracking
const CartStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="CartMain" component={CartScreen} />
        <Stack.Screen name="Checkout" component={CheckoutScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
);

// Stack for Orders to Tracking
const OrdersStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MyOrdersMain" component={MyOrdersScreen} />
        <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    </Stack.Navigator>
);

// Stack for Profile
const ProfileStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileMain" component={ProfileScreen} />
        <Stack.Screen name="Reservation" component={ReservationScreen} />
        <Stack.Screen name="MyReservations" component={MyReservationsScreen} />
    </Stack.Navigator>
);

const CustomerTabs = () => {
    const { getCartCount } = useContext(CartContext);

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.grey,
                tabBarStyle: { paddingBottom: 5, height: 60 },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = focused ? 'home' : 'home-outline';
                    } else if (route.name === 'Menu') {
                        iconName = focused ? 'fast-food' : 'fast-food-outline';
                    } else if (route.name === 'Cart') {
                        iconName = focused ? 'cart' : 'cart-outline';
                    } else if (route.name === 'Orders') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Profile') {
                        iconName = focused ? 'person' : 'person-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeStack} />
            <Tab.Screen name="Menu" component={MenuStack} />
            <Tab.Screen
                name="Cart"
                component={CartStack}
                options={{
                    tabBarBadge: getCartCount() > 0 ? getCartCount() : null,
                    tabBarBadgeStyle: { backgroundColor: colors.accent, color: colors.white }
                }}
            />
            <Tab.Screen name="Orders" component={OrdersStack} />
            <Tab.Screen name="Profile" component={ProfileStack} />
        </Tab.Navigator>
    );
};

export default CustomerTabs;
