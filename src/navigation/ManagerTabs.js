
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

// Screens
import ManagerDashboard from '../screens/manager/ManagerDashboard';
import ManageOrdersScreen from '../screens/manager/ManageOrdersScreen';
import OrderDetailScreen from '../screens/manager/OrderDetailScreen';
import MenuManagementScreen from '../screens/manager/MenuManagementScreen';
import AddEditMenuItemScreen from '../screens/manager/AddEditMenuItemScreen';
import ReservationManagementScreen from '../screens/manager/ReservationManagementScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Stack for Orders
const ManageOrdersStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ManageOrdersMain" component={ManageOrdersScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
);

// Stack for Menu
const MenuManagementStack = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MenuManagementMain" component={MenuManagementScreen} />
        <Stack.Screen name="AddEditMenuItem" component={AddEditMenuItemScreen} />
    </Stack.Navigator>
);

const ManagerTabs = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.grey,
                tabBarStyle: { paddingBottom: 5, height: 60 },
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;

                    if (route.name === 'Dashboard') {
                        iconName = focused ? 'grid' : 'grid-outline';
                    } else if (route.name === 'Orders') {
                        iconName = focused ? 'list' : 'list-outline';
                    } else if (route.name === 'Menu') {
                        iconName = focused ? 'fast-food' : 'fast-food-outline';
                    } else if (route.name === 'Reservations') {
                        iconName = focused ? 'calendar' : 'calendar-outline';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Dashboard" component={ManagerDashboard} />
            <Tab.Screen name="Orders" component={ManageOrdersStack} />
            <Tab.Screen name="Menu" component={MenuManagementStack} />
            <Tab.Screen name="Reservations" component={ReservationManagementScreen} />
        </Tab.Navigator>
    );
};

export default ManagerTabs;
