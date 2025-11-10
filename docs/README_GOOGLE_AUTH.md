# 🚀 Google Authentication Setup Guide

Panduan lengkap untuk testing Google Authentication di Scory App.

---

## 📋 Prerequisites

Sebelum mulai testing, pastikan:

1. ✅ Backend server sudah running
2. ✅ Dependencies sudah ter-install (sudah otomatis)
3. ✅ Tahu IP address backend server

---

## ⚙️ Konfigurasi

### 1. Update API URL

Buka file `services/api.ts` dan ganti IP address dengan IP backend Anda:

```typescript
const API_URL = __DEV__
  ? 'http://192.168.1.100:5000/api/v1' // ⚠️ GANTI IP INI
  : 'https://api.scory.app/api/v1';
```

**Cara cek IP backend:**
- Windows: `ipconfig` → cari IPv4 Address
- Mac/Linux: `ifconfig` → cari inet address

---

## 🧪 Testing

### 1. Test Backend Health Check

Pastikan backend bisa diakses dari handphone/emulator:

```bash
# Dari browser handphone, buka:
http://192.168.1.100:5000/health

# Atau test dari terminal:
curl http://192.168.1.100:5000/health
```

Harus return:
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "Connected"
}
```

### 2. Run Expo App

```bash
npm start
```

Atau untuk platform spesifik:
```bash
npm run android
npm run ios
```

### 3. Test Google Login Flow

1. Buka app → akan muncul Login Screen
2. Klik tombol **"Continue with Google"**
3. Popup Google OAuth akan muncul
4. Pilih akun Google
5. Authorize aplikasi
6. App akan otomatis redirect ke Home Screen jika berhasil

---

## 🔍 Debugging

### Check Console Logs

Cek console untuk log messages:

```
✅ Login successful: user@gmail.com    # Berhasil
❌ Auth error: Network request failed  # Backend tidak reachable
❌ Login failed: Invalid token         # Token verification gagal
```

### Common Issues

**Problem: "Network request failed"**
- ✅ Backend tidak running → Start backend server
- ✅ IP salah → Update `services/api.ts` dengan IP yang benar
- ✅ Handphone/emulator tidak satu network → Pastikan WiFi sama

**Problem: "Failed to authenticate with Google"**
- ✅ Web Client ID salah → Check `services/auth.ts`
- ✅ Backend Google credentials salah → Contact backend developer

**Problem: Google popup tidak muncul**
- ✅ Clear Expo cache: `npx expo start -c`
- ✅ Rebuild app

---

## 📂 File Structure

```
services/
  ├── api.ts          # Axios instance + JWT interceptor
  └── auth.ts         # Google Auth logic + hooks

app/
  └── (auth)/
      └── login.tsx   # Login screen dengan Google Auth
```

---

## 🔐 How It Works

```
1. User klik "Continue with Google"
   ↓
2. Google OAuth popup muncul
   ↓
3. User authorize → dapat idToken
   ↓
4. App kirim idToken ke backend: POST /api/v1/auth/google
   ↓
5. Backend verify token dengan Google
   ↓
6. Backend create/update user di database
   ↓
7. Backend return JWT token + user data
   ↓
8. App simpan JWT token di AsyncStorage
   ↓
9. Auto redirect ke Home Screen
```

---

## 📱 Testing Checklist

- [ ] Backend health check berhasil
- [ ] IP address sudah di-update di `services/api.ts`
- [ ] App bisa build dan run
- [ ] Google login button berfungsi
- [ ] Google popup muncul
- [ ] Bisa pilih akun Google
- [ ] Auto redirect ke Home setelah login
- [ ] Token tersimpan di AsyncStorage
- [ ] Console log menunjukkan "Login successful"

---

## 💡 Tips

1. **Selalu test health check dulu** sebelum test login
2. **Pastikan backend dan mobile di WiFi yang sama** saat development
3. **Check console logs** untuk debugging
4. **Clear app data** jika ada masalah: Settings → Apps → Scory → Clear Data

---

## 🆘 Need Help?

Kalau masih ada error:
1. Screenshot error message
2. Check console logs
3. Verify backend logs
4. Contact backend developer dengan info error

Happy Testing! 🎉
