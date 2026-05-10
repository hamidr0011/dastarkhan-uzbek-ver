const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const AUTH_REDIRECT_URI = process.env.EXPO_PUBLIC_AUTH_REDIRECT_URI || 'dastarkhanuzbekistan://auth/callback';
const GOOGLE_AUTH_ENABLED = process.env.EXPO_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

const getSupabaseHeaders = (token) => ({
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${token || SUPABASE_ANON_KEY}`,
    'Content-Type': 'application/json',
});

const parseSupabaseResponse = async (response) => {
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
        const rawMessage = payload.error_description || payload.msg || payload.message || 'Supabase request failed';
        const normalizedMessage = rawMessage.toLowerCase();

        if (normalizedMessage.includes('rate limit')) {
            throw new Error('Supabase email rate limit exceeded. If this signup already worked, confirm the email and log in. Otherwise wait before trying again or configure custom SMTP in Supabase.');
        }

        if (normalizedMessage.includes('unsupported provider') || normalizedMessage.includes('provider is not enabled')) {
            throw new Error('Google sign-in is not enabled in Supabase yet. Enable the Google provider in Supabase Auth, then set EXPO_PUBLIC_GOOGLE_AUTH_ENABLED=true.');
        }

        throw new Error(rawMessage);
    }

    return payload;
};

const getProfile = async (userId, accessToken) => {
    const response = await fetch(
        `${SUPABASE_URL}/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,name,email,phone,role`,
        {
            headers: getSupabaseHeaders(accessToken),
        }
    );
    const profiles = await parseSupabaseResponse(response);
    return profiles[0] || null;
};

const upsertProfile = async ({ userId, name, email, phone, role, accessToken }) => {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
        method: 'POST',
        headers: {
            ...getSupabaseHeaders(accessToken),
            Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify({
            id: userId,
            name,
            email: email.toLowerCase(),
            phone,
            role,
        }),
    });
    const profiles = await parseSupabaseResponse(response);
    return profiles[0] || { id: userId, name, email, phone, role };
};

const buildSessionUser = async ({ authUser, accessToken, fallback = {} }) => {
    const metadata = authUser?.user_metadata || {};
    let profile = accessToken ? await getProfile(authUser.id, accessToken).catch(() => null) : null;

    if (!profile && accessToken) {
        profile = await upsertProfile({
            userId: authUser.id,
            name: metadata.name || fallback.name || authUser.email,
            email: authUser.email || fallback.email,
            phone: metadata.phone || fallback.phone || '',
            role: metadata.role || fallback.role || 'customer',
            accessToken,
        }).catch(() => null);
    }

    return {
        id: authUser.id,
        email: authUser.email || fallback.email,
        name: profile?.name || metadata.name || fallback.name || authUser.email,
        phone: profile?.phone || metadata.phone || fallback.phone || '',
        role: profile?.role || metadata.role || fallback.role || 'customer',
        token: accessToken,
        authProvider: 'supabase',
    };
};

export const registerWithSupabase = async ({ name, email, password, phone, role }) => {
    if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({
            email: email.toLowerCase(),
            password,
            data: { name, phone, role },
        }),
    });
    const payload = await parseSupabaseResponse(response);

    if (payload.session?.access_token && payload.user?.id) {
        await upsertProfile({
            userId: payload.user.id,
            name,
            email,
            phone,
            role,
            accessToken: payload.session.access_token,
        });
    }

    return {
        success: true,
        requiresEmailConfirmation: !payload.session,
        user: payload.user,
    };
};

export const loginWithSupabase = async (email, password) => {
    if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    }

    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({
            email: email.toLowerCase(),
            password,
        }),
    });
    const payload = await parseSupabaseResponse(response);
    const sessionUser = await buildSessionUser({
        authUser: payload.user,
        accessToken: payload.access_token,
        fallback: { email },
    });

    return {
        success: true,
        user: sessionUser,
    };
};

export const getGoogleOAuthUrl = () => {
    if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    }

    if (!GOOGLE_AUTH_ENABLED) {
        throw new Error('Google sign-in is waiting for Supabase provider setup. Add the Google Client ID and Secret in Supabase Auth, allow dastarkhanuzbekistan://auth/callback, then set EXPO_PUBLIC_GOOGLE_AUTH_ENABLED=true.');
    }

    const params = [
        ['provider', 'google'],
        ['redirect_to', AUTH_REDIRECT_URI],
        ['scopes', 'email profile'],
    ]
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');

    return `${SUPABASE_URL}/auth/v1/authorize?${params}`;
};

export const loginWithOAuthTokens = async ({ accessToken, refreshToken }) => {
    if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY.');
    }

    if (!accessToken) {
        throw new Error('Google sign-in did not return an access token.');
    }

    const userResponse = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: getSupabaseHeaders(accessToken),
    });
    const authUser = await parseSupabaseResponse(userResponse);

    const sessionUser = await buildSessionUser({
        authUser,
        accessToken,
        fallback: {
            name: authUser?.user_metadata?.full_name || authUser?.user_metadata?.name,
            role: 'customer',
        },
    });

    return {
        success: true,
        user: {
            ...sessionUser,
            refreshToken,
        },
    };
};

export const logoutFromSupabase = async (token) => {
    if (!isSupabaseConfigured || !token) return;

    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
        method: 'POST',
        headers: getSupabaseHeaders(token),
    }).catch(() => null);
};
