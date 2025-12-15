# Token Management - Diagnosis & Solution

## 🔍 Masalah yang Ditemukan

### 1. **Tidak Ada Mekanisme Refresh Token**
**Masalah:**
- Aplikasi hanya menyimpan satu JWT token tanpa refresh token
- Ketika token expired (biasanya 1-24 jam), user langsung di-logout
- Tidak ada cara untuk memperpanjang sesi tanpa login ulang

**Dampak:**
- User harus login berulang kali
- Pengalaman pengguna buruk (session cepat habis)
- Token "cepat invalid" karena langsung dihapus saat expired

### 2. **Token Langsung Dihapus Saat Error 401**
**Masalah:**
- Di `api.ts` line 50-58, setiap error 401 langsung menghapus token
- Tidak ada upaya untuk refresh token terlebih dahulu
- Bahkan jika hanya satu request yang gagal, semua token dihapus

**Dampak:**
- User di-logout meskipun token sebenarnya bisa di-refresh
- Tidak ada retry mechanism untuk request yang gagal

### 3. **Tidak Ada Validasi Token Expiry**
**Masalah:**
- Aplikasi tidak mengecek apakah token akan expired sebelum digunakan
- Token baru dicek valid/invalid setelah request gagal dengan 401
- Setiap request mengambil token dari AsyncStorage tanpa validasi

**Dampak:**
- Banyak request gagal dengan 401 sebelum token di-refresh
- Network overhead karena request gagal dan harus diulang

### 4. **Race Condition Pada Multiple Requests**
**Masalah:**
- Jika banyak request concurrent dan token expired
- Semua request akan mencoba refresh token secara bersamaan
- Bisa menyebabkan multiple refresh requests ke backend

**Dampak:**
- Backend overload dengan refresh requests
- Kemungkinan token conflict atau race condition

## ✅ Solusi yang Diimplementasikan

### 1. **Token Manager (`services/tokenManager.ts`)**
Sistem manajemen token yang komprehensif dengan fitur:

#### a. **Token Storage dengan Expiry Tracking**
```typescript
// Menyimpan token + decode expiry time
await saveToken(accessToken, refreshToken);
```
- Otomatis decode JWT untuk mendapatkan expiry time
- Menyimpan expiry time di AsyncStorage
- Support refresh token storage

#### b. **Automatic Token Validation**
```typescript
// Cek apakah token expired atau akan expired (buffer 5 menit)
const expired = await isTokenExpired(5);
```
- Mengecek expiry sebelum token benar-benar expired
- Buffer time 5 menit untuk mencegah race condition
- Proactive refresh sebelum token expired

#### c. **Automatic Token Refresh**
```typescript
// Mendapatkan token yang valid (auto-refresh jika perlu)
const token = await getValidToken();
```
- Otomatis refresh jika token expired atau akan expired
- Menggunakan refresh token untuk mendapatkan access token baru
- Transparent untuk caller (tidak perlu tahu tentang refresh)

#### d. **Refresh Token Endpoint**
```typescript
// Call backend /auth/refresh dengan refresh token
const response = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
```
- Mendapatkan access token baru dari backend
- Menyimpan token baru beserta expiry time
- Clear tokens jika refresh gagal (refresh token invalid)

### 2. **Updated API Interceptor (`services/api.ts`)**

#### a. **Request Interceptor dengan Auto-Refresh**
```typescript
// Sebelum setiap request, dapatkan token yang valid
const token = await getValidToken();
```
- Otomatis refresh token jika expired sebelum request
- Mengurangi kemungkinan request gagal dengan 401
- Proactive token management

#### b. **Response Interceptor dengan Retry Logic**
```typescript
// Jika 401, coba refresh token dan retry request
if (error.response?.status === 401 && !originalRequest._retry) {
  const newToken = await refreshAccessToken();
  if (newToken) {
    // Retry request dengan token baru
    return api(originalRequest);
  }
}
```
- Automatic retry untuk request yang gagal dengan 401
- Mencegah user di-logout jika token bisa di-refresh
- Queue management untuk multiple concurrent requests

#### c. **Request Queue Management**
```typescript
let isRefreshing = false;
let failedQueue = [];
```
- Mencegah multiple refresh requests concurrent
- Queue requests yang gagal saat refresh sedang berlangsung
- Process queue setelah refresh selesai

### 3. **Updated Auth Services**

#### a. **`services/auth.ts`**
- Semua fungsi auth (login, register, Google auth) menggunakan `saveToken()`
- Logout menggunakan `clearTokens()` untuk clear semua token
- Support refresh token dari backend response

#### b. **`services/googleAuth.ts`**
- Google Sign In menyimpan refresh token
- Sign out clear semua tokens
- Konsisten dengan auth.ts

## 🔧 Cara Kerja Sistem Baru

### Flow Normal Request:
```
1. User membuat request
2. Request interceptor:
   - Cek apakah token expired (dengan buffer 5 menit)
   - Jika expired → refresh token otomatis
   - Attach token ke header
3. Request dikirim ke backend
4. Response diterima
```

### Flow Request dengan Token Expired:
```
1. User membuat request
2. Request interceptor:
   - Token sudah expired
   - Panggil refreshAccessToken()
   - Dapatkan token baru dari backend
   - Attach token baru ke header
3. Request dikirim dengan token baru
4. Response diterima (sukses)
```

### Flow 401 Error (Token Invalid):
```
1. Request gagal dengan 401
2. Response interceptor:
   - Cek apakah sudah retry (_retry flag)
   - Jika belum, coba refresh token
   - Jika refresh sukses → retry request
   - Jika refresh gagal → clear tokens & reject
3. User tetap login jika refresh sukses
   ATAU
   User di-logout jika refresh gagal
```

### Flow Multiple Concurrent Requests:
```
1. 5 requests concurrent, token expired
2. Request pertama:
   - Set isRefreshing = true
   - Mulai refresh token
3. Request 2-5:
   - Lihat isRefreshing = true
   - Masuk ke queue (failedQueue)
   - Tunggu refresh selesai
4. Refresh selesai:
   - Process queue (retry semua request)
   - Set isRefreshing = false
5. Semua request berhasil dengan token baru
```

## 📋 Checklist Backend Requirements

Untuk sistem ini bekerja optimal, backend harus support:

### ✅ Required Endpoints:

1. **POST /auth/refresh**
   ```json
   Request:
   {
     "refreshToken": "xxx"
   }
   
   Response:
   {
     "success": true,
     "data": {
       "token": "new_access_token",
       "refreshToken": "new_refresh_token" // optional
     }
   }
   ```

2. **Update Auth Endpoints (login, register, Google auth)**
   ```json
   Response harus include refreshToken:
   {
     "success": true,
     "data": {
       "user": {...},
       "token": "access_token",
       "refreshToken": "refresh_token"
     }
   }
   ```

### 🔒 Token Configuration:
- **Access Token**: Short-lived (15 menit - 1 jam)
- **Refresh Token**: Long-lived (7-30 hari)
- **Token Type**: JWT dengan expiry claim (`exp`)

## 🚀 Keuntungan Sistem Baru

1. **User Experience Lebih Baik**
   - User tidak perlu login berulang kali
   - Session tetap aktif selama refresh token valid
   - Seamless token refresh (transparent)

2. **Lebih Aman**
   - Access token short-lived (lebih sulit dicuri)
   - Refresh token dapat di-revoke di backend
   - Automatic cleanup jika refresh gagal

3. **Performance Lebih Baik**
   - Proactive token refresh (sebelum expired)
   - Mengurangi failed requests
   - Queue management untuk concurrent requests

4. **Maintainability**
   - Centralized token management
   - Consistent token handling across app
   - Easy to debug dan monitor

## 📝 Next Steps

1. **Backend Implementation**
   - Implement `/auth/refresh` endpoint
   - Update auth endpoints untuk return refresh token
   - Configure token expiry times

2. **Testing**
   - Test token refresh flow
   - Test concurrent requests
   - Test token expiry scenarios
   - Test logout flow

3. **Monitoring**
   - Log token refresh events
   - Monitor refresh failures
   - Track token expiry patterns

## 🐛 Debugging Tips

Jika masih ada masalah:

1. **Check Token Expiry**
   ```typescript
   import { isTokenExpired, getToken } from '@/services/tokenManager';
   
   const expired = await isTokenExpired();
   const token = await getToken();
   console.log('Token expired:', expired);
   console.log('Token:', token);
   ```

2. **Check Refresh Token**
   ```typescript
   import { getRefreshToken } from '@/services/tokenManager';
   
   const refreshToken = await getRefreshToken();
   console.log('Refresh token:', refreshToken);
   ```

3. **Monitor API Calls**
   - Uncomment logging di `api.ts`
   - Check console untuk refresh attempts
   - Monitor 401 errors

4. **Check Backend Response**
   - Pastikan backend return refreshToken
   - Pastikan /auth/refresh endpoint works
   - Check token expiry times di backend
