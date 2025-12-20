# Cara Mendapatkan SHA256 Fingerprint

## 1. SHA256 untuk Debug Build (Preview)

### Windows:
```bash
cd android/app
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Mac/Linux:
```bash
cd android/app
keytool -list -v -keystore debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Atau menggunakan Expo (Recommended):
```bash
npx expo credentials:manager
# Pilih Android
# Pilih "Keystore"
# Pilih "Show keystore info"
```

**Copy SHA256** yang muncul (format: `AA:BB:CC:DD:...`)

---

## 2. SHA256 untuk Production Build (Google Play)

### **CARA TERMUDAH: Google Play Console (UI Terbaru 2025)**

**Lokasi SHA-256 bisa ada di salah satu tempat ini:**

**Opsi 1: Menu "App Integrity" (Paling Umum)**
1. Buka: https://play.google.com/console
2. Pilih app: **Scory** (`com.habdilali.scoryapps`)
3. Di **menu kiri**, scroll ke bawah, cari **"Release"** atau **"Grow"**
4. Klik **"App integrity"** (atau **"App signing"**)
5. Di halaman yang terbuka, cari section **"App signing key certificate"**
6. Copy **SHA-256 certificate fingerprint** (format: `AA:BB:CC:DD:...`)

**Opsi 2: Lewat Setup**
1. Buka: https://play.google.com/console
2. Pilih app: **Scory**
3. Klik **"Setup"** di menu kiri
4. Scroll cari **"App signing"** atau **"App integrity"**
5. Copy SHA-256 yang ada

**Opsi 3: Direct Link (Ganti dengan ID Anda)**
```
https://play.google.com/console/u/0/developers/[YOUR_DEV_ID]/app/[APP_ID]/app-signing
```

**Opsi 4: Pakai Search Bar**
1. Di Google Play Console, ada search bar di pojok kanan atas
2. Ketik: **"app signing"**
3. Klik hasil yang muncul → akan langsung ke halaman App Signing

---

### **CARA ALTERNATIF: Download APK dari Google Play, Ekstrak SHA-256**

**Jika Google Play Console UI membingungkan, pakai cara manual ini:**

**Step 1: Download APK dari Internal Testing Track**
1. Google Play Console → Testing → Internal testing
2. Klik tab **"Releases"**
3. Cari release terbaru yang sudah di-upload
4. Download APK/AAB (biasanya ada tombol download atau link)

**ATAU pakai device Android:**
1. Install app dari Internal Testing di device
2. Pakai `adb` untuk extract APK:
```bash
adb shell pm path com.habdilali.scoryapps
# Output: package:/data/app/~~xxx/com.habdilali.scoryapps/base.apk

adb pull /data/app/~~xxx/com.habdilali.scoryapps/base.apk ./scory-production.apk
```

**Step 2: Ekstrak SHA-256 dari APK**
```bash
# Windows (download apksigner from Android SDK):
apksigner verify --print-certs scory-production.apk

# Mac/Linux:
keytool -printcert -jarfile scory-production.apk

# Atau pakai online tool:
# https://www.apksigner.io/ (upload APK, lihat certificate info)
```

**Copy SHA-256** yang muncul.

---

### **CARA PALING MUDAH: Pakai EAS CLI (Jika Build dengan EAS)**

```bash
# Jalankan di terminal:
npx eas credentials -p android

# Pilih opsi:
# → Select platform: Android
# → Keystore: Manage everything needed to build your project
# → View Keystore
```

EAS akan tampilkan:
- **Keystore fingerprint (SHA-256)**
- **Keystore fingerprint (SHA-1)**

**Copy SHA-256** tersebut.

---

### **CARA DARURAT: Kontak Google Play Support**

Jika semua cara di atas gagal:
1. Google Play Console → Help → Contact support
2. Tanya: "Where can I find SHA-256 certificate fingerprint for app signing?"
3. Mereka akan kasih screenshot atau direct link

---

## 3. Menambahkan SHA256 ke Google Cloud Console

1. Buka: https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. Cari **OAuth 2.0 Client IDs** untuk Android
4. Klik **Edit** atau **Create** jika belum ada
5. Isi:
   - **Application type**: Android
   - **Package name**: `com.habdilali.scoryapps`
   - **SHA-1 certificate fingerprint**: (opsional, bisa dikosongkan)
   - **SHA-256 certificate fingerprint**:
     - Tambahkan SHA256 dari **debug.keystore**
     - Klik **Add fingerprint**
     - Tambahkan SHA256 dari **Google Play App Signing**
6. Klik **Save**

**PENTING**: Anda bisa menambahkan MULTIPLE SHA-256 fingerprints untuk satu package name!

---

## 4. Verifikasi Konfigurasi

Setelah menambahkan SHA256, pastikan di Google Cloud Console ada:

1. **Web Client ID** (untuk iOS dan web):
   - Client ID: `302081173028-tb9ekj8f1er45vmgehre61mvjk48hi2o.apps.googleusercontent.com`
   - Type: Web application

2. **Android Client ID**:
   - Package name: `com.habdilali.scoryapps`
   - SHA-256 fingerprints: **MINIMAL 2**
     - Debug keystore (untuk preview build)
     - Google Play App Signing (untuk production build)

---

## 5. Testing

Setelah menambahkan SHA256:
- **Tunggu 5-10 menit** untuk propagasi
- **Uninstall** app dari device
- **Download ulang** dari Google Play Internal Testing
- **Login** dengan Google

---

## Troubleshooting

### Error: "Developer Error" atau "Sign in failed"
- ✅ Cek apakah SHA256 sudah ditambahkan ke Google Cloud Console
- ✅ Tunggu 5-10 menit setelah menambahkan SHA256
- ✅ Pastikan package name sama: `com.habdilali.scoryapps`
- ✅ Pastikan webClientId benar di kode

### Error: "SIGN_IN_CANCELLED"
- User membatalkan login (bukan error)

### Error: "PLAY_SERVICES_NOT_AVAILABLE"
- Device tidak support Google Play Services
- Test di device lain atau emulator dengan Google Play
