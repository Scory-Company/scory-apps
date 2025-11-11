# Google OAuth Setup Guide

This guide explains how to configure Google OAuth for both development (Expo Go) and production builds.

## 📋 Overview

The app uses **environment-aware OAuth configuration**:

- **Expo Go (Development)**: Web Client ID + Expo's auth proxy
- **Production/Dev Builds**: Android/iOS Client IDs + native redirect handling

## 🔑 Client IDs

All Client IDs are in `services/auth.ts`:

```typescript
const GOOGLE_CONFIG = {
  webClientId: '302081173028-tb9ekj8f1er45vmgehre61mvjk48hi2o.apps.googleusercontent.com',
  androidClientId: '302081173028-3dn1kpvih879h52k9bcq0ib4hk5ue7c5.apps.googleusercontent.com',
  iosClientId: '302081173028-r9s2p6nku4djqigqr4al352ujl989a9v.apps.googleusercontent.com',
};
```

## 🚀 Production Setup (Android)

### 1. Get Production Keystore SHA-1

For production builds, you need the **production keystore SHA-1 fingerprint**.

#### Using EAS (Recommended):

```bash
npx expo credentials:manager
```

Select:
1. **Android**
2. **Production**
3. **Keystore: Manage everything needed to build your project**
4. **Display Android keystore credentials**

Copy the **SHA1 Fingerprint** that appears.

#### Manual Method:

If you have your own keystore:

```bash
keytool -list -v -keystore your-production.keystore -alias your-alias
```

### 2. Configure Android Client ID in Google Cloud Console

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your project
3. Click on **Android Client ID** (`302081173028-3dn1kpvih879h52k9bcq0ib4hk5ue7c5`)

**Configure:**
- **Package name**: `com.habdilali.scoryapps`
- **SHA-1 certificate fingerprint**: [Paste production SHA-1 from step 1]

4. Click **SAVE**
5. Wait 5-10 minutes for changes to propagate

### 3. Build Production APK/AAB

```bash
# For Google Play Store (AAB)
npx eas build --profile production --platform android

# For direct distribution (APK)
npx eas build --profile production --platform android --format apk
```

### 4. Test Production Build

1. Download and install the production build
2. Test Google Sign In
3. Check logs for any OAuth errors

## 🔧 Development Build Setup (Android)

For development builds (non-Expo Go), you need **debug keystore SHA-1**.

### 1. Get Development Keystore SHA-1

```bash
npx expo credentials:manager
```

Select:
1. **Android**
2. **Development**
3. **Keystore: Manage everything needed to build your project**
4. **Display Android keystore credentials**

Copy the **SHA1 Fingerprint**.

### 2. Add Debug SHA-1 to Android Client ID

In Google Cloud Console, under the same Android Client ID:
- Click **+ ADD FINGERPRINT**
- Paste the debug SHA-1
- Click **SAVE**

Now you can have **both production and debug SHA-1** in the same Client ID.

### 3. Build Development Build

```bash
npx eas build --profile development --platform android
```

## 📱 Expo Go Setup (Development Only)

For quick development with Expo Go (no build required):

### 1. Configure Web Client ID

In Google Cloud Console:
1. Click **Web Client ID** (`302081173028-tb9ekj8f1er45vmgehre61mvjk48hi2o`)
2. Under **Authorized redirect URIs**, add:

```
https://auth.expo.io/@habdil_ali/scory-apps
```

3. Click **SAVE**
4. Wait 5-10 minutes

### 2. Test with Expo Go

```bash
npx expo start
```

Scan QR code with Expo Go app and test Google Sign In.

## 🍎 iOS Production Setup

### 1. Get iOS Bundle Identifier

From `app.json`:
```json
"ios": {
  "bundleIdentifier": "com.habdilali.scoryapps"
}
```

### 2. Configure iOS Client ID

In Google Cloud Console:
1. Click **iOS Client ID** (`302081173028-r9s2p6nku4djqigqr4al352ujl989a9v`)
2. **Bundle ID**: `com.habdilali.scoryapps`
3. Click **SAVE**

### 3. Build iOS Production

```bash
npx eas build --profile production --platform ios
```

## 🐛 Troubleshooting

### Error 400: redirect_uri_mismatch

**Cause**: Redirect URI not whitelisted in Google Cloud Console.

**Solution**:
1. Check logs for actual redirect URI being used
2. Verify it matches exactly in Google Console
3. Wait 5-10 minutes after adding new URIs
4. Clear app cache and restart

### Error: Invalid Client ID

**Cause**: Wrong Client ID for the build type.

**Solution**:
- Expo Go: Use Web Client ID
- Production/Dev Build: Use Android/iOS Client ID

### SHA-1 Fingerprint Mismatch

**Cause**: App signed with different keystore than configured.

**Solution**:
1. Get SHA-1 from actual keystore used
2. Add it to Google Cloud Console
3. Rebuild app if needed

## 📊 Summary Matrix

| Environment | Client ID | Redirect URI | Setup Required |
|------------|-----------|--------------|----------------|
| **Expo Go** | Web | `https://auth.expo.io/@habdil_ali/scory-apps` | Add redirect URI to Web Client |
| **Development Build** | Android/iOS | Auto (native) | Add debug SHA-1 to Android Client |
| **Production** | Android/iOS | Auto (native) | Add production SHA-1 to Android Client |

## 🔗 Useful Links

- Google Cloud Console: https://console.cloud.google.com/
- EAS Credentials Manager: `npx expo credentials:manager`
- Expo Auth Session Docs: https://docs.expo.dev/versions/latest/sdk/auth-session/
- Google OAuth Setup: https://developers.google.com/identity/protocols/oauth2

## 📝 Notes

- **Never commit keystores** to git
- **Keep SHA-1 fingerprints** documented securely
- **Test OAuth** on real devices before production release
- **Both debug and production SHA-1** can coexist in Google Console
- Changes in Google Console take **5-10 minutes** to propagate
