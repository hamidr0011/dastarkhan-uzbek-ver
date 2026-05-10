import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const SESSION_KEY = '@dastarkhan_user_session';

export const hasSupabaseDataConfig = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const getSession = async () => {
    const userSession = await AsyncStorage.getItem(SESSION_KEY);
    return userSession ? JSON.parse(userSession) : null;
};

const getHeaders = async (prefer) => {
    const session = await getSession();

    return {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${session?.token || SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
        ...(prefer ? { Prefer: prefer } : {}),
    };
};

const parseResponse = async (response) => {
    const payload = await response.json().catch(() => null);

    if (!response.ok) {
        throw new Error(payload?.message || payload?.msg || payload?.error || 'Supabase request failed');
    }

    return payload;
};

const query = async (path, options = {}) => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
        ...options,
        headers: {
            ...(await getHeaders(options.prefer)),
            ...(options.headers || {}),
        },
    });

    return parseResponse(response);
};

const toApiResponse = async (work) => {
    try {
        const data = await work();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getMenuItemsFromSupabase = async (filters = {}) => toApiResponse(async () => {
    const clauses = ['select=*'];
    if (filters.category && filters.category !== 'All') clauses.push(`category=eq.${encodeURIComponent(filters.category)}`);
    if (filters.available) clauses.push('available=eq.true');
    if (filters.search) clauses.push(`name=ilike.*${encodeURIComponent(filters.search)}*`);
    clauses.push('order=category.asc,name.asc');

    return query(`menu_items?${clauses.join('&')}`);
});

export const getSpecialsFromSupabase = async () => toApiResponse(async () => (
    query('menu_items?select=*&is_special=eq.true&available=eq.true&order=name.asc')
));

export const addMenuItemToSupabase = async (item) => toApiResponse(async () => {
    const rows = await query('menu_items', {
        method: 'POST',
        prefer: 'return=representation',
        body: JSON.stringify(item),
    });
    return rows[0];
});

export const updateMenuItemInSupabase = async (id, item) => toApiResponse(async () => {
    const rows = await query(`menu_items?id=eq.${id}`, {
        method: 'PATCH',
        prefer: 'return=representation',
        body: JSON.stringify(item),
    });
    return rows[0];
});

export const deleteMenuItemFromSupabase = async (id) => toApiResponse(async () => {
    await query(`menu_items?id=eq.${id}`, {
        method: 'DELETE',
    });
    return { id };
});

export const toggleMenuItemInSupabase = async (id, available) => (
    updateMenuItemInSupabase(id, { available, updated_at: new Date().toISOString() })
);

export const placeOrderInSupabase = async (orderData) => toApiResponse(async () => {
    const session = await getSession();
    if (!session?.id) throw new Error('Please log in before placing an order.');

    const rows = await query('orders', {
        method: 'POST',
        prefer: 'return=representation',
        body: JSON.stringify({
            order_code: `UZB-${Math.floor(1000 + Math.random() * 9000)}`,
            customer_id: session.id,
            customer_name: session.name,
            items: orderData.items,
            subtotal: orderData.subtotal,
            tax: orderData.tax,
            total: orderData.total,
            currency: 'UZS',
            status: 'Placed',
            order_type: orderData.orderType,
            table_number: orderData.tableNumber,
            guest_count: orderData.guestCount,
            pickup_name: orderData.pickupName,
            pickup_time: orderData.pickupTime,
            payment_method: orderData.paymentMethod,
            payment_status: orderData.paymentStatus,
            payment_reference: orderData.paymentReference,
            special_request: orderData.specialRequest || '',
        }),
    });

    return rows[0];
});

export const getMyOrdersFromSupabase = async () => toApiResponse(async () => {
    const session = await getSession();
    if (!session?.id) throw new Error('Please log in to view orders.');

    return query(`orders?select=*&customer_id=eq.${session.id}&order=created_at.desc`);
});

export const getAllOrdersFromSupabase = async (status) => toApiResponse(async () => {
    const filters = ['select=*'];
    if (status && status !== 'All') filters.push(`status=eq.${encodeURIComponent(status)}`);
    filters.push('order=created_at.desc');

    return query(`orders?${filters.join('&')}`);
});

export const checkTableFromSupabase = async (tableNumber) => {
    try {
        const activeOrders = await query(
            `orders?select=id&table_number=eq.${tableNumber}&status=in.(Placed,Preparing,Ready)&limit=1`
        );
        const activeReservations = await query(
            `reservations?select=id&table_number=eq.${tableNumber}&status=eq.Confirmed&limit=1`
        );

        return {
            success: true,
            tableNumber,
            available: activeOrders.length === 0 && activeReservations.length === 0,
        };
    } catch (error) {
        return { success: false, error: error.message, available: false };
    }
};

export const updateOrderStatusInSupabase = async (id, status) => toApiResponse(async () => {
    const rows = await query(`orders?id=eq.${id}`, {
        method: 'PATCH',
        prefer: 'return=representation',
        body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    });
    return rows[0];
});

export const cancelOrderInSupabase = async (id) => updateOrderStatusInSupabase(id, 'Cancelled');

export const createReservationInSupabase = async (reservation) => toApiResponse(async () => {
    const session = await getSession();
    if (!session?.id) throw new Error('Please log in before creating a reservation.');

    const rows = await query('reservations', {
        method: 'POST',
        prefer: 'return=representation',
        body: JSON.stringify({
            customer_id: session.id,
            name: session.name,
            email: session.email,
            phone: session.phone || reservation.phone || '',
            date: reservation.date,
            time: reservation.time,
            guests: reservation.guests,
            table_number: reservation.tableNumber || null,
            special_requests: reservation.specialRequests || '',
            status: 'Confirmed',
        }),
    });

    return rows[0];
});

export const getMyReservationsFromSupabase = async () => toApiResponse(async () => {
    const session = await getSession();
    if (!session?.id) throw new Error('Please log in to view reservations.');

    return query(`reservations?select=*&customer_id=eq.${session.id}&order=created_at.desc`);
});

export const getAllReservationsFromSupabase = async (status) => toApiResponse(async () => {
    const filters = ['select=*'];
    if (status && status !== 'All') filters.push(`status=eq.${encodeURIComponent(status)}`);
    filters.push('order=created_at.desc');

    return query(`reservations?${filters.join('&')}`);
});

export const updateReservationStatusInSupabase = async (id, status) => toApiResponse(async () => {
    const rows = await query(`reservations?id=eq.${id}`, {
        method: 'PATCH',
        prefer: 'return=representation',
        body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    });
    return rows[0];
});

export const cancelReservationInSupabase = async (id) => updateReservationStatusInSupabase(id, 'Cancelled');
