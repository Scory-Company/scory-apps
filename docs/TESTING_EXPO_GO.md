# 📱 Testing Google Auth dengan Expo Go

Panduan khusus untuk testing Google Authentication di HP fisik menggunakan Expo Go.

---

## ⚠️ Penting untuk Backend Developer

Karena testing pakai **Expo Go**, redirect URI yang digunakan adalah:

```
https://auth.expo.io/@habdil_ali/scory-apps
```

**Backend Developer harus whitelist URI ini di Google Cloud Console!**

### 📝 Langkah Backend Developer:

1. Buka [Google Cloud Console](https://console.cloud.google.com)
2. Pilih project Scory
3. **APIs & Services** → **Credentials**
4. Klik **Web Client ID** (`302081173028-tb9ekj8f1er45vmgehre61mvjk48hi2o`)
5. Di **Authorized redirect URIs**, pastikan ada:
   ```
   https://auth.expo.io/@habdil_ali/scory-apps
   ```
6. **Hapus** redirect URIs yang error (yang pakai `com.habdilali.scoryapps://` atau `exp://IP`)
7. **Save** dan tunggu 1-2 menit untuk propagasi

---

## 📱 Setup di HP

### 1. Install Expo Go

Download dari:
- **Android:** [Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
- **iOS:** [App Store](https://apps.apple.com/app/expo-go/id982107779)

### 2. Pastikan HP dan Laptop di WiFi yang Sama

Cek koneksi:
- HP dan laptop harus terhubung ke WiFi yang sama
- Tidak boleh ada firewall yang block port 8081

---

## 🚀 Testing Steps

### 1. Update API URL di `services/api.ts`

Ganti IP dengan IP laptop Anda:

```typescript
const API_URL = __DEV__
  ? 'http://192.168.X.XXX:5000/api/v1' // Ganti dengan IP laptop
  : 'https://api.scory.app/api/v1';
```

**Cara cek IP laptop:**
- Windows: `ipconfig` → cari IPv4 Address (contoh: 192.168.1.100)
- Mac/Linux: `ifconfig` → cari inet (contoh: 192.168.1.100)

### 2. Pastikan Backend Running

Test dari browser HP:
```
http://192.168.X.XXX:5000/health
```

Harus muncul:
```json
{
  "status": "OK",
  "message": "Server is running",
  "database": "Connected"
}
```

### 3. Start Expo

Di laptop, jalankan:
```bash
npx expo start -c
```

### 4. Scan QR Code

- Buka **Expo Go** di HP
- **Android:** Scan QR code dari terminal
- **iOS:** Buka Camera app → scan QR code

### 5. Test Login

1. App terbuka di HP
2. Klik **"Continue with Google"**
3. Browser akan terbuka untuk Google login
4. Pilih akun Google
5. Klik **Allow/Izinkan**
6. Browser akan redirect kembali ke app
7. Seharusnya auto-login dan redirect ke Home

---

## 🔍 Troubleshooting

### ❌ Error: "invalid_request"

**Penyebab:** Redirect URI belum di-whitelist

**Solusi:**
1. Pastikan backend sudah tambahkan `https://auth.expo.io/@habdil_ali/scory-apps`
2. Tunggu 1-2 menit setelah save
3. Clear cache: `npx expo start -c`
4. Test lagi

---

### ❌ Error: "Network request failed"

**Penyebab:** Backend tidak reachable dari HP

**Solusi:**
1. Cek HP dan laptop di WiFi yang sama
2. Test health check dari browser HP: `http://IP_LAPTOP:5000/health`
3. Pastikan firewall tidak block port 5000
4. Update IP di `services/api.ts`

---

### ❌ Browser buka tapi stuck di "Redirecting..."

**Penyebab:** Expo Go tidak handle redirect dengan benar

**Solusi:**
1. Close browser
2. Kembali ke Expo Go app
3. Test lagi

---

### ❌ "Failed to authenticate with Google"

**Penyebab:** Backend tidak bisa verify token

**Solusi:**
1. Check backend logs
2. Pastikan backend credentials correct
3. Verify token dikirim ke endpoint yang benar

---

## 📊 Debug Checklist

Sebelum test, pastikan:

- [ ] Backend running dan accessible dari HP
- [ ] Health check berhasil dari browser HP
- [ ] Backend sudah whitelist `https://auth.expo.io/@habdil_ali/scory-apps`
- [ ] IP address di `services/api.ts` sudah benar
- [ ] HP dan laptop di WiFi yang sama
- [ ] Expo Go ter-install di HP
- [ ] QR code ter-scan dengan benar

---

## 💡 Tips

1. **Selalu test health check dulu** sebelum test Google login
2. **Pakai Expo Go terminal logs** untuk debugging (lihat console di laptop)
3. **Clear Expo cache** kalau ada masalah: `npx expo start -c`
4. **Restart Expo Go** di HP kalau app freeze
5. **Check backend logs** untuk error dari sisi server

---

## 🎯 Expected Flow

```
1. User klik "Continue with Google" di app
   ↓
2. Browser terbuka (Chrome/Safari di HP)
   ↓
3. Muncul halaman pilih akun Google
   ↓
4. User pilih akun → klik Allow
   ↓
5. Browser redirect ke Expo auth proxy
   ↓
6. Expo auth proxy extract token
   ↓
7. App dapat idToken dari Expo proxy
   ↓
8. App kirim idToken ke backend
   ↓
9. Backend verify dengan Google
   ↓
10. Backend return JWT token + user data
   ↓
11. App save token di AsyncStorage
   ↓
12. Auto redirect ke Home screen
   ↓
✅ Login berhasil!
```

---

## 📞 Need Help?

Kalau masih error:

1. **Screenshot error message** dari app
2. **Check Expo terminal logs** di laptop
3. **Check backend logs** untuk error
4. **Verify redirect URI** di Google Cloud Console

---

## 🔄 Alternative: Build APK/IPA

Kalau Expo Go terlalu banyak limitasi, bisa build development build:

```bash
# Build untuk Android
npx eas build --profile development --platform android

# Build untuk iOS
npx eas build --profile development --platform ios
```

Tapi ini butuh EAS account dan lebih lama.

---

Happy Testing! 🚀
