# Google OAuth Production Setup - Step by Step

## ✅ Yang Sudah Dikerjakan

1. ✅ Installed `@react-native-google-signin/google-signin`
2. ✅ Added config plugin to `app.json`
3. ✅ Created `services/googleAuth.ts` with proper implementation
4. ✅ Updated `app/_layout.tsx` to configure Google Sign In on startup
5. ✅ Updated `LoginForm.tsx` with Google Sign In button
6. ✅ Started building development build

## 🔄 Yang Sedang Berjalan

**Development Build in Progress:**
```bash
npx eas build --profile development --platform android
```

Build ini akan memakan waktu **15-30 menit**. Sambil menunggu, kamu bisa prepare Google Cloud Console.

## 📋 Next Steps (Setelah Build Selesai)

### Step 1: Get SHA-1 Fingerprint

**Method A: From EAS Dashboard**
1. Buka: https://expo.dev/accounts/habdil_ali/projects/scory-apps/credentials
2. Select **Android**
3. Select **Development** environment
4. Copy **SHA-1 Fingerprint**

**Method B: From Build Logs**
SHA-1 akan muncul di build logs setelah build selesai.

**Method C: Manual Extract (if you have the keystore)**
```bash
keytool -list -v -keystore path/to/keystore.jks -alias keyalias
```

### Step 2: Update Google Cloud Console

1. **Buka Google Cloud Console:**
   - https://console.cloud.google.com/apis/credentials

2. **Edit Android Client ID:**
   - Client ID: `302081173028-3dn1kpvih879h52k9bcq0ib4hk5ue7c5`

3. **Configure:**
   - **Package name**: `com.habdilali.scoryapps`
   - **SHA-1 certificate fingerprint**: [Paste SHA-1 dari Step 1]

4. **Save & Wait:**
   - Click **SAVE**
   - Wait **5-10 minutes** for propagation

### Step 3: Download & Install Development Build

1. **Check Build Status:**
   - Go to: https://expo.dev/accounts/habdil_ali/projects/scory-apps/builds
   - Wait until status = **FINISHED**

2. **Download APK:**
   - Click on the build
   - Click **Download**
   - Transfer APK to your Android device

3. **Install:**
   - Open APK on device
   - Allow "Install from Unknown Sources" if needed
   - Install the app

### Step 4: Test Google Sign In

1. **Open the app** on device
2. Go to **Login screen**
3. Click **"Continue with Google"**
4. Should open Google account picker
5. Select account and sign in
6. Should redirect back to app with successful login

### Step 5: Troubleshooting

**If "Error 10" or "Developer Error":**
- SHA-1 not matching → Re-check SHA-1 in Google Console
- Package name not matching → Re-check package name
- Wait 10 minutes after updating Google Console

**If "Sign in cancelled":**
- User cancelled the flow (normal behavior)

**If "Play Services not available":**
- Device doesn't have Google Play Services (use emulator with Play Store)

## 🎯 Production Build (Nanti)

For production build, you'll need to add **production SHA-1** too:

1. Get production SHA-1:
   ```bash
   npx eas credentials
   # Select: Android → Production → Keystore → Display
   ```

2. Add production SHA-1 to the same Android Client ID in Google Console

3. Build production:
   ```bash
   npx eas build --profile production --platform android
   ```

## 📊 Configuration Summary

| Environment | Package Name | SHA-1 Source | Client ID |
|------------|--------------|--------------|-----------|
| **Development** | `com.habdilali.scoryapps` | EAS Development Keystore | Android Client ID |
| **Production** | `com.habdilali.scoryapps` | EAS Production Keystore | Android Client ID |

**Important Notes:**
- ✅ Same **Android Client ID** can have multiple SHA-1 fingerprints
- ✅ Add both development and production SHA-1 to same Client ID
- ✅ No need for separate Client IDs per environment
- ✅ Package name must match exactly in app.json and Google Console

## 🔗 Useful Links

- **EAS Dashboard**: https://expo.dev/accounts/habdil_ali/projects/scory-apps
- **Google Cloud Console**: https://console.cloud.google.com/apis/credentials
- **Build Status**: https://expo.dev/accounts/habdil_ali/projects/scory-apps/builds
- **React Native Google Sign In Docs**: https://react-native-google-signin.github.io/docs/setting-up/expo

## 💡 Pro Tips

1. **Always test on real device** - Emulator might have Play Services issues
2. **Keep SHA-1 documented** - Save them in a secure place
3. **Wait full 10 minutes** after updating Google Console
4. **Check build logs** for any config errors
5. **Clear app data** between tests if needed

---

**Status:** ⏳ Waiting for development build to complete...
