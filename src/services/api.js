import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    addMenuItemToSupabase,
    cancelOrderInSupabase,
    cancelReservationInSupabase,
    checkTableFromSupabase,
    createReservationInSupabase,
    deleteMenuItemFromSupabase,
    getAllOrdersFromSupabase,
    getAllReservationsFromSupabase,
    getMenuItemsFromSupabase,
    getMyOrdersFromSupabase,
    getMyReservationsFromSupabase,
    getSpecialsFromSupabase,
    hasSupabaseDataConfig,
    placeOrderInSupabase,
    toggleMenuItemInSupabase,
    updateMenuItemInSupabase,
    updateOrderStatusInSupabase,
    updateReservationStatusInSupabase,
} from './supabaseData';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://assignmentno2madby9061-production.up.railway.app/api';

const normalizeOrder = (order) => {
    if (!order) return order;

    return {
        ...order,
        orderCode: order.orderCode || order.order_code,
        customerName: order.customerName || order.customer_name,
        orderType: order.orderType || order.order_type,
        tableNumber: order.tableNumber || order.table_number,
        guestCount: order.guestCount || order.guest_count,
        pickupName: order.pickupName || order.pickup_name,
        pickupTime: order.pickupTime || order.pickup_time,
        paymentMethod: order.paymentMethod || order.payment_method,
        paymentStatus: order.paymentStatus || order.payment_status,
        paymentReference: order.paymentReference || order.payment_reference,
        specialRequest: order.specialRequest || order.special_request,
        timestamp: order.timestamp || order.created_at,
    };
};

const normalizeOrdersResponse = (payload) => ({
    ...payload,
    data: Array.isArray(payload.data) ? payload.data.map(normalizeOrder) : normalizeOrder(payload.data),
});

const getHeaders = async () => {
    const session = await AsyncStorage.getItem('@dastarkhan_user_session');
    const parsed = session ? JSON.parse(session) : null;
    return {
        'Content-Type': 'application/json',
        ...(parsed?.token ? { Authorization: `Bearer ${parsed.token}` } : {})
    };
};

// ─── AUTH ──────────────────────────────────────────
export const registerUser = async (userData) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });
    return res.json();
};

export const loginUser = async (email, password) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    return res.json();
};

// ─── MENU ──────────────────────────────────────────
export const getMenuItems = async (filters = {}) => {
    if (hasSupabaseDataConfig) return getMenuItemsFromSupabase(filters);

    const params = Object.entries(filters)
        .filter(([, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/menu?${params}`, { headers });
    return res.json();
};

export const getSpecials = async () => {
    if (hasSupabaseDataConfig) return getSpecialsFromSupabase();

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/menu/specials`, { headers });
    return res.json();
};

export const addMenuItem = async (item) => {
    if (hasSupabaseDataConfig) return addMenuItemToSupabase(item);

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/menu`, {
        method: 'POST', headers, body: JSON.stringify(item)
    });
    return res.json();
};

export const updateMenuItem = async (id, item) => {
    if (hasSupabaseDataConfig) return updateMenuItemInSupabase(id, item);

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/menu/${id}`, {
        method: 'PUT', headers, body: JSON.stringify(item)
    });
    return res.json();
};

export const toggleMenuItemAvailability = async (id, available) => {
    if (hasSupabaseDataConfig) return toggleMenuItemInSupabase(id, available);

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/menu/${id}/availability`, {
        method: 'PATCH', headers, body: JSON.stringify({ available })
    });
    return res.json();
};

export const deleteMenuItem = async (id) => {
    if (hasSupabaseDataConfig) return deleteMenuItemFromSupabase(id);

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/menu/${id}`, {
        method: 'DELETE', headers
    });
    return res.json();
};

// ─── ORDERS ────────────────────────────────────────
export const placeOrder = async (orderData) => {
    if (hasSupabaseDataConfig) return normalizeOrdersResponse(await placeOrderInSupabase(orderData));

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/orders`, {
        method: 'POST', headers, body: JSON.stringify(orderData)
    });
    return normalizeOrdersResponse(await res.json());
};

export const getMyOrders = async () => {
    if (hasSupabaseDataConfig) return normalizeOrdersResponse(await getMyOrdersFromSupabase());

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/orders/my-orders`, { headers });
    return normalizeOrdersResponse(await res.json());
};

export const getAllOrders = async (status) => {
    if (hasSupabaseDataConfig) return normalizeOrdersResponse(await getAllOrdersFromSupabase(status));

    const headers = await getHeaders();
    const params = status && status !== 'All' ? `?status=${status}` : '';
    const res = await fetch(`${BASE_URL}/orders${params}`, { headers });
    return normalizeOrdersResponse(await res.json());
};

export const checkTableAvailability = async (tableNumber) => {
    if (hasSupabaseDataConfig) return checkTableFromSupabase(tableNumber);

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/orders/tables/${tableNumber}/availability`, { headers });
    return res.json();
};

export const updateOrderStatus = async (id, status) => {
    if (hasSupabaseDataConfig) return normalizeOrdersResponse(await updateOrderStatusInSupabase(id, status));

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/orders/${id}/status`, {
        method: 'PATCH', headers, body: JSON.stringify({ status })
    });
    return normalizeOrdersResponse(await res.json());
};

export const cancelOrder = async (id) => {
    if (hasSupabaseDataConfig) return normalizeOrdersResponse(await cancelOrderInSupabase(id));

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/orders/${id}/cancel`, {
        method: 'PATCH', headers
    });
    return normalizeOrdersResponse(await res.json());
};

// ─── RESERVATIONS ──────────────────────────────────
export const createReservation = async (data) => {
    if (hasSupabaseDataConfig) return createReservationInSupabase(data);

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/reservations`, {
        method: 'POST', headers, body: JSON.stringify(data)
    });
    return res.json();
};

export const getMyReservations = async () => {
    if (hasSupabaseDataConfig) return getMyReservationsFromSupabase();

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/reservations/my-reservations`, { headers });
    return res.json();
};

export const getAllReservations = async (status) => {
    if (hasSupabaseDataConfig) return getAllReservationsFromSupabase(status);

    const headers = await getHeaders();
    const params = status && status !== 'All' ? `?status=${status}` : '';
    const res = await fetch(`${BASE_URL}/reservations${params}`, { headers });
    return res.json();
};

export const cancelReservation = async (id) => {
    if (hasSupabaseDataConfig) return cancelReservationInSupabase(id);

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/reservations/${id}/cancel`, {
        method: 'PATCH', headers
    });
    return res.json();
};

export const updateReservationStatus = async (id, status) => {
    if (hasSupabaseDataConfig) return updateReservationStatusInSupabase(id, status);

    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/reservations/${id}/status`, {
        method: 'PATCH', headers, body: JSON.stringify({ status })
    });
    return res.json();
};

export const getDashboardStats = async () => {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}/reservations/stats/dashboard`, { headers });
    return res.json();
};
