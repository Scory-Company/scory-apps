<div align="center">
  <img src="./assets/images/icon.png" alt="Scory Logo" width="120" height="120" />
  <h1>Dokumentasi Aplikasi Scory</h1>
  <p><em>Research Journal Learning App</em></p>
</div>

---

## Tentang Aplikasi

**Scory** adalah aplikasi mobile untuk pembelajaran jurnal penelitian yang mengubah jurnal akademik kompleks menjadi konten yang mudah dipahami dan menarik.

**Fitur Utama:**
- Rekomendasi artikel yang dipersonalisasi
- Organisasi konten berbasis kategori
- Pelacakan tujuan membaca dan insight
- Pencarian dan filter artikel
- Manajemen koleksi studi

**Tech Stack:**
- React Native 0.81.4
- Expo SDK 54
- TypeScript
- Expo Router (File-based routing)

---

## Prasyarat Instalasi

Sebelum menjalankan aplikasi, pastikan sistem Anda sudah terinstal:

### 1. Node.js dan npm
- **Node.js** versi 18 atau lebih tinggi
- Download dari: https://nodejs.org/
- Verifikasi instalasi:
  ```bash
  node --version
  npm --version
  ```

### 2. Git
- Download dari: https://git-scm.com/
- Verifikasi instalasi:
  ```bash
  git --version
  ```

### 3. Expo CLI (Opsional)
```bash
npm install -g expo-cli
```

### 4. Perangkat untuk Testing

Pilih salah satu:

#### A. Android (Pilih salah satu)
- **Android Studio** dengan emulator
  - Download: https://developer.android.com/studio
  - Setup Android Virtual Device (AVD)
- **Perangkat Android fisik** dengan mode Developer aktif

#### B. iOS (Hanya untuk Mac)
- **Xcode** dengan iOS Simulator
  - Download dari App Store
  - Minimum macOS 13.5 atau lebih tinggi
- **Perangkat iPhone/iPad fisik**

#### C. Expo Go App (Paling Mudah)
- Install **Expo Go** dari:
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) (Android)
  - [Apple App Store](https://apps.apple.com/app/expo-go/id982107779) (iOS)

---

## Instalasi Aplikasi

### 1. Clone Repository

```bash
git clone <repository-url>
cd scory-apps
```

### 2. Install Dependencies

```bash
npm install
```

**Catatan:** Jika ada error terkait dependencies, jalankan:
```bash
npx expo install --fix
```

### 3. Konfigurasi Environment

Copy file `.env.example` menjadi `.env`:

```bash
# Windows (Command Prompt)
copy .env.example .env

# Windows (PowerShell)
Copy-Item .env.example .env

# Mac/Linux
cp .env.example .env
```

Edit file `.env` dan sesuaikan dengan konfigurasi Anda:

```env
# Ganti dengan IP address backend server Anda
API_URL_DEV=http://192.168.1.100:5000/api/v1

# URL production (jika sudah deploy)
API_URL_PROD=https://api.scory.app/api/v1
```

**Cara mendapatkan IP Address:**
- Windows: Buka CMD dan ketik `ipconfig`
- Mac/Linux: Buka Terminal dan ketik `ifconfig`
- Cari bagian "IPv4 Address" atau "inet"

---

## Menjalankan Aplikasi

### Metode 1: Menggunakan Expo Go (Paling Mudah)

1. **Jalankan Development Server:**
   ```bash
   npm start
   ```
   atau
   ```bash
   npx expo start
   ```

2. **Scan QR Code:**
   - **Android**: Buka Expo Go app → Scan QR code dari terminal
   - **iOS**: Buka Camera app → Scan QR code → Tap notifikasi Expo Go

3. **Aplikasi akan otomatis terbuka di Expo Go**

### Metode 2: Menggunakan Android Emulator

1. **Jalankan Android Studio dan start emulator**

2. **Jalankan aplikasi:**
   ```bash
   npm run android
   ```
   atau
   ```bash
   npx expo run:android
   ```

### Metode 3: Menggunakan iOS Simulator (Mac Only)

1. **Jalankan aplikasi:**
   ```bash
   npm run ios
   ```
   atau
   ```bash
   npx expo run:ios
   ```

### Metode 4: Web Browser

```bash
npm run web
```

Aplikasi akan terbuka di browser di `http://localhost:8081`

---

## Command Reference

### Development Commands

| Command | Deskripsi |
|---------|-----------|
| `npm start` | Jalankan development server |
| `npm run android` | Jalankan di Android emulator/device |
| `npm run ios` | Jalankan di iOS simulator/device |
| `npm run web` | Jalankan di web browser |
| `npm run lint` | Jalankan ESLint untuk code quality check |

### Maintenance Commands

| Command | Deskripsi |
|---------|-----------|
| `npm run clean` | Bersihkan cache dan build files |
| `npm run fresh-install` | Install ulang semua dependencies |
| `npx expo start --clear` | Jalankan dengan clear cache |

### Build & Deploy Commands

| Command | Deskripsi |
|---------|-----------|
| `npm run draft` | Buat preview update (EAS Workflow) |
| `npm run development-builds` | Buat development builds (EAS Workflow) |
| `npm run deploy` | Deploy ke production (EAS Workflow) |

---

## Troubleshooting

### 1. Aplikasi Tidak Bisa Connect ke Backend

**Problem:** Error "Network request failed" atau timeout

**Solusi:**
- Pastikan backend server sudah running
- Cek IP address di file `.env` sudah benar
- Pastikan device/emulator dan backend server dalam jaringan yang sama
- Matikan firewall yang mungkin block koneksi
- Untuk Android emulator, gunakan `10.0.2.2` bukan `localhost`

### 2. Error saat npm install

**Problem:** Dependency conflict atau error saat install

**Solusi:**
```bash
# Hapus node_modules dan install ulang
npm run fresh-install

# Atau manual
rm -rf node_modules package-lock.json
npm install

# Fix compatibility issues
npx expo install --fix
```

### 3. Expo Go Error: "Unable to resolve module"

**Problem:** Expo Go tidak support native modules tertentu

**Solusi:**
Aplikasi ini menggunakan custom native modules (Google Sign-In), jadi perlu **development build**:

```bash
# Buat development build
npm run development-builds

# Atau manual
npx eas build --profile development --platform android
npx eas build --profile development --platform ios
```

### 4. Android Build Failed

**Problem:** Build error di Android

**Solusi:**
```bash
# Clear gradle cache
cd android
./gradlew clean

# Kembali ke root dan clean
cd ..
npm run clean

# Install ulang dan run
npm install
npm run android
```

### 5. Metro Bundler Error

**Problem:** Metro bundler crash atau hang

**Solusi:**
```bash
# Clear metro cache
npx expo start --clear

# Atau reset semua cache
npm run clean
```

### 6. TypeScript Errors

**Problem:** Type errors di development

**Solusi:**
```bash
# Check TypeScript errors
npx tsc --noEmit

# Install type definitions yang missing
npm install --save-dev @types/react @types/react-native
```

---

## Development Setup (untuk Developer)

### Struktur Folder

```
scory-apps/
├── app/                    # Expo Router screens
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── index.tsx      # Home screen
│   │   ├── explore.tsx    # Explore screen
│   │   ├── learn.tsx      # Learn screen
│   │   └── profile.tsx    # Profile screen
│   └── _layout.tsx        # Root layout
├── features/              # Feature modules
│   ├── home/             # Home features
│   ├── explore/          # Explore features
│   ├── learn/            # Learn features
│   └── shared/           # Shared components
├── data/mock/            # Mock data (development)
├── constants/            # Theme & constants
├── hooks/                # Custom hooks
├── assets/               # Images & fonts
├── .env                  # Environment variables
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

### Code Standards

- **TypeScript**: Semua code harus typed
- **Naming**: Gunakan PascalCase untuk components, camelCase untuk functions
- **Theme**: Gunakan color system dari `@/constants/theme`
- **Mock Data**: Centralized di `@/data/mock`

### Testing di Real Device

#### Android (via USB Debugging):
1. Enable Developer Options di Android
2. Enable USB Debugging
3. Connect via USB
4. Run: `npm run android`

#### iOS (via Xcode):
1. Connect iPhone via USB
2. Trust computer di iPhone
3. Select device di Xcode
4. Run: `npm run ios`

---

## Build untuk Production

### Android APK/AAB

```bash
# Build APK untuk testing
npx eas build --platform android --profile preview

# Build AAB untuk Google Play Store
npx eas build --platform android --profile production
```

### iOS IPA

```bash
# Build untuk TestFlight/App Store
npx eas build --platform ios --profile production
```

### Submit ke Store

```bash
# Submit ke Google Play Store
npx eas submit --platform android

# Submit ke Apple App Store
npx eas submit --platform ios
```

**Catatan:** Pastikan sudah setup EAS account dan configure credentials

---

## Additional Resources

### Dokumentasi Resmi
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)
- [Expo Router](https://docs.expo.dev/router/introduction/)
- [EAS Build](https://docs.expo.dev/build/introduction/)

### Project Documentation
- `AGENTS.md` - Developer guidelines & architecture
- `CLAUDE.md` - AI agent instructions
- `README.md` - Basic project info

---

## Kontak & Support

**Project Manager:** Habdil Iqrawardana
**Developer:** Tiko

Untuk issue atau pertanyaan, silakan buat issue di repository GitHub atau hubungi tim development.

---

## FAQ

### Q: Apakah bisa run tanpa backend?
**A:** Aplikasi menggunakan mock data untuk development, jadi bisa run tanpa backend. Namun fitur autentikasi dan sinkronisasi data butuh backend server.

### Q: Kenapa harus pakai development build, tidak bisa Expo Go saja?
**A:** Aplikasi ini menggunakan native modules seperti Google Sign-In yang tidak support di Expo Go. Development build diperlukan untuk testing fitur-fitur tersebut.

### Q: Berapa lama waktu build pertama kali?
**A:** Build pertama kali via EAS bisa memakan waktu 10-20 menit tergantung koneksi internet dan antrian server EAS.

### Q: Apakah support Android dan iOS?
**A:** Ya, aplikasi ini cross-platform dan support Android 5.0+ dan iOS 13.0+

### Q: Bagaimana cara update aplikasi di device setelah build?
**A:** Gunakan EAS Update untuk push OTA updates tanpa rebuild:
```bash
npx eas update --branch production
```

---

**Last Updated:** 2026-01-03
**Version:** 1.0.0
