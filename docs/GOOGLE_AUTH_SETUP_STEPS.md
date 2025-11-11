# 🔐 Google Authentication Setup - Quick Guide

Build development sudah selesai! Sekarang tinggal connect dengan Google OAuth.

## ✅ Status Sekarang

- ✅ Development build created
- ✅ Keystore generated
- ✅ Code sudah ready (GoogleSignIn integrated)
- ⏳ **Next:** Setup Google Cloud Console dengan SHA-1

---

## 📋 Step-by-Step Setup

### **Step 1: Get SHA-1 Fingerprint**

#### Option A: EAS Dashboard (EASIEST)
1. Buka: **https://expo.dev/accounts/habdil_ali/projects/scory-apps/credentials**
2. Click **"Android"**
3. Click **"Development"** profile
4. Find **"Keystore"** section
5. Copy **SHA-1 Fingerprint** (format: `AA:BB:CC:DD:...`)

#### Option B: Build Page
1. Buka: **https://expo.dev/accounts/habdil_ali/projects/scory-apps/builds/98f372bf-8c12-4f80-8414-4ef01d3e3c77**
2. Scroll ke bagian **"Credentials"**
3. Copy SHA-1 fingerprint

---

### **Step 2: Update Google Cloud Console**

1. **Buka Google Cloud Console:**
   - https://console.cloud.google.com/apis/credentials
   - Pilih project **"Scory Journal"** atau project kamu

2. **Find Android Client ID:**
   - Cari Client ID: `302081173028-3dn1kpvih879h52k9bcq0ib4hk5ue7c5`
   - Atau cari yang type **"Android"**
   - Click untuk edit

3. **Configure Android Client ID:**

   **Package name:**
   ```
   com.habdilali.scoryapps
   ```

   **SHA-1 certificate fingerprint:**
   ```
   [Paste SHA-1 dari Step 1 di sini]
   ```

   **Example format:** `A1:B2:C3:D4:E5:F6:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12`

4. **Save:**
   - Click **"SAVE"** button (biru di bawah)
   - Wait **5-10 minutes** untuk Google propagate changes

---

### **Step 3: Download & Install Development Build**

#### Download APK:

**Option A: Scan QR Code**
- Scan QR code yang muncul di terminal
- Akan redirect ke download page

**Option B: Direct Link**
```
https://expo.dev/accounts/habdil_ali/projects/scory-apps/builds/98f372bf-8c12-4f80-8414-4ef01d3e3c77
```

#### Install:
1. Download APK ke Android device
2. Allow "Unknown Sources" kalau diminta
3. Install APK
4. Open app

---

### **Step 4: Start Development Server**

Di terminal, jalankan:
```bash
npx expo start --dev-client
```

Scan QR code atau press 'a' untuk open di device.

---

### **Step 5: Test Google Sign In**

1. App akan open di device
2. Go to **Login screen**
3. Click **"Continue with Google"** button
4. Should show native Google account picker
5. Select your Google account
6. App should redirect back dengan user logged in ✅

---

## 🐛 Troubleshooting

### Error: "Developer Error" atau Error Code 10

**Cause:** SHA-1 fingerprint tidak match atau belum propagate.

**Solution:**
1. Verify SHA-1 di Google Console **exactly match** dengan EAS
2. Wait **full 10 minutes** setelah save di Google Console
3. Clear app data: Settings → Apps → Scory → Clear Data
4. Restart app dan try again

---

### Error: "Sign in cancelled"

**Cause:** User cancelled the sign in flow (normal).

**Solution:** User action, try again.

---

### Error: "Play Services not available"

**Cause:** Device tidak punya Google Play Services.

**Solution:**
- Test di device lain yang punya Play Store
- Atau test di emulator dengan Google Play

---

### Error: "UNAUTHORIZED_CLIENT"

**Cause:** Package name tidak match.

**Solution:**
- Verify package name di Google Console = `com.habdilali.scoryapps`
- Verify package name di app.json match

---

## 📊 Configuration Summary

| Item | Value |
|------|-------|
| **Package Name** | `com.habdilali.scoryapps` |
| **Web Client ID** | `302081173028-tb9ekj8f1er45vmgehre61mvjk48hi2o.apps.googleusercontent.com` |
| **Android Client ID** | `302081173028-3dn1kpvih879h52k9bcq0ib4hk5ue7c5.apps.googleusercontent.com` |
| **Build Profile** | `development` |
| **Build URL** | https://expo.dev/accounts/habdil_ali/projects/scory-apps/builds/98f372bf-8c12-4f80-8414-4ef01d3e3c77 |

---

## 🔗 Important Links

- **EAS Credentials:** https://expo.dev/accounts/habdil_ali/projects/scory-apps/credentials
- **Build Page:** https://expo.dev/accounts/habdil_ali/projects/scory-apps/builds/98f372bf-8c12-4f80-8414-4ef01d3e3c77
- **Google Cloud Console:** https://console.cloud.google.com/apis/credentials

---

## ✅ Checklist

- [ ] Get SHA-1 dari EAS credentials page
- [ ] Add SHA-1 ke Google Cloud Console (Android Client ID)
- [ ] Verify package name = `com.habdilali.scoryapps`
- [ ] Save & wait 10 minutes
- [ ] Download APK
- [ ] Install APK di Android device
- [ ] Start dev server: `npx expo start --dev-client`
- [ ] Test Google Sign In
- [ ] Verify user logged in successfully

---

## 🎯 Next Steps After Google Auth Works

1. ✅ Commit changes ke git
2. ✅ Update PROGRESS_REPORT.md
3. ✅ Lanjut ke Persistent Session feature
4. ✅ Implement OnBoarding Skip Logic

---

**Current Status:** ⏳ Waiting untuk setup Google Cloud Console dengan SHA-1
