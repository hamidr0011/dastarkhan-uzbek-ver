# Supabase Auth Setup

The app is connected to this Supabase project:

- Project URL: `https://hdylwezwuxpripcdynqu.supabase.co`
- App redirect URI: `dastarkhanuzbekistan://auth/callback`
- Supabase OAuth callback URL: `https://hdylwezwuxpripcdynqu.supabase.co/auth/v1/callback`

## Manual Email Signup

Supabase's built-in email sender is rate limited. If signup succeeds once, do not keep registering the same email. Confirm the email if confirmations are enabled, then log in.

For testing, you can temporarily disable email confirmations in Supabase:

1. Open Supabase Dashboard.
2. Go to Authentication > Providers > Email.
3. Turn off Confirm email.
4. Save.

For production, keep confirmations enabled and configure custom SMTP:

1. Go to Project Settings > Authentication > SMTP Settings.
2. Add SMTP credentials from your email provider.
3. Save and test signup again.

## Google Sign-In

The app has both Supabase OAuth and Better Auth client wiring. Google still needs real Google OAuth credentials before the button can work.

1. Create a Google OAuth client in Google Cloud Console.
2. Add this authorized redirect URI in Google:
   `https://hdylwezwuxpripcdynqu.supabase.co/auth/v1/callback`
3. Copy the Google Client ID and Client Secret.
4. In Supabase, go to Authentication > Providers > Google.
5. Enable Google and paste the Client ID and Secret.
6. In Supabase Authentication > URL Configuration, add:
   `dastarkhanuzbekistan://auth/callback`
7. In `.env`, change:
   `EXPO_PUBLIC_GOOGLE_AUTH_ENABLED=true`
8. Restart Expo with cache clear.

## Better Auth

The Better Auth API key is a backend secret. Keep it in `restaurant-app-backend/.env`, not in Expo `EXPO_PUBLIC_` variables.

Required backend values:

- `BETTER_AUTH_API_KEY`
- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL=http://192.168.1.10:5000`
- `DATABASE_URL`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`

For Better Auth Google, configure Google with this callback URL:

`http://192.168.1.10:5000/api/better-auth/callback/google`

Google does not accept LAN IP addresses like `192.168.1.10` for web OAuth redirect URIs. For Expo Go on a real phone, use a public HTTPS tunnel or deployed backend instead:

`https://cape-culture-lyrics.ngrok-free.dev/api/better-auth/callback/google`

Then set both:

- Backend `BETTER_AUTH_URL=https://cape-culture-lyrics.ngrok-free.dev`
- Expo `EXPO_PUBLIC_BETTER_AUTH_URL=https://cape-culture-lyrics.ngrok-free.dev`

The mobile app points to:

`EXPO_PUBLIC_BETTER_AUTH_URL=http://192.168.1.10:5000`
