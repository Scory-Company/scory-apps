# Token Debugging Guide

## 🔍 Cara Mengecek Token Issues

### 1. **Check Token Status**

Tambahkan di component atau screen yang bermasalah:

```typescript
import { printTokenInfo } from '@/utils/tokenDebug';

// Di dalam component
useEffect(() => {
  printTokenInfo();
}, []);
```

Output akan menampilkan:
```
========== TOKEN DEBUG INFO ==========
Has Access Token: true
Has Refresh Token: true
Is Expired: false
Expiry Time: 15/12/2025, 20:30:00
Time Until Expiry: 2 jam 10 menit

Token Payload:
- User ID: 12345
- Email: user@example.com
- Issued At: 15/12/2025, 18:20:00
======================================
```

### 2. **Test Token Refresh**

Untuk test apakah refresh token berfungsi:

```typescript
import { testTokenRefresh } from '@/utils/tokenDebug';

// Di button atau action
const handleTestRefresh = async () => {
  const success = await testTokenRefresh();
  if (success) {
    Alert.alert('Success', 'Token refreshed successfully!');
  } else {
    Alert.alert('Error', 'Token refresh failed!');
  }
};
```

### 3. **Simulate Token Expiry**

Untuk testing bagaimana app handle token expired:

```typescript
import { simulateTokenExpiry, printTokenInfo } from '@/utils/tokenDebug';

// Simulate expiry
await simulateTokenExpiry();

// Check status
await printTokenInfo();

// Try to make API call - should trigger auto-refresh
```

### 4. **Monitor API Calls**

Di `services/api.ts`, uncomment logging untuk melihat request flow:

```typescript
// Line 24-27 di api.ts
const method = config.method?.toUpperCase() || 'GET';
const path = config.url || '';
console.log(`[API] ${method} ${path}`);
```

### 5. **Check AsyncStorage**

Untuk melihat semua data yang disimpan:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const checkStorage = async () => {
  const token = await AsyncStorage.getItem('token');
  const refreshToken = await AsyncStorage.getItem('refreshToken');
  const tokenExpiry = await AsyncStorage.getItem('tokenExpiry');
  const user = await AsyncStorage.getItem('user');
  
  console.log('Token:', token?.substring(0, 20) + '...');
  console.log('Refresh Token:', refreshToken?.substring(0, 20) + '...');
  console.log('Token Expiry:', tokenExpiry);
  console.log('User:', user);
};
```

## 🐛 Common Issues & Solutions

### Issue 1: Token Cepat Expired
**Symptom:** User harus login berulang kali dalam waktu singkat

**Debug:**
```typescript
import { getTokenInfo } from '@/utils/tokenDebug';

const info = await getTokenInfo();
console.log('Time until expiry:', info.timeUntilExpiry);
```

**Possible Causes:**
1. Backend set token expiry terlalu pendek
2. Refresh token tidak di-return oleh backend
3. Refresh endpoint tidak berfungsi

**Solution:**
- Check backend token expiry configuration
- Pastikan backend return `refreshToken` di response
- Test `/auth/refresh` endpoint

### Issue 2: Token Invalid Setelah Beberapa Saat
**Symptom:** App berfungsi normal, tiba-tiba logout sendiri

**Debug:**
```typescript
// Add di response interceptor (api.ts)
console.log('401 Error:', error.response?.data);
console.log('Original request:', error.config?.url);
```

**Possible Causes:**
1. Backend revoke token
2. Token signature invalid
3. Clock skew antara client & server

**Solution:**
- Check backend logs untuk token validation
- Pastikan server time sync
- Check token payload dengan `decodeJWT()`

### Issue 3: Refresh Token Tidak Berfungsi
**Symptom:** Auto-refresh gagal, user tetap logout

**Debug:**
```typescript
import { testTokenRefresh } from '@/utils/tokenDebug';

const success = await testTokenRefresh();
console.log('Refresh success:', success);
```

**Possible Causes:**
1. Backend `/auth/refresh` endpoint tidak ada
2. Refresh token format salah
3. Refresh token expired

**Solution:**
- Test refresh endpoint dengan Postman/curl
- Check refresh token di AsyncStorage
- Check backend refresh token expiry

### Issue 4: Multiple Concurrent Requests Gagal
**Symptom:** Beberapa request gagal bersamaan saat token expired

**Debug:**
```typescript
// Add logging di api.ts response interceptor
console.log('isRefreshing:', isRefreshing);
console.log('failedQueue length:', failedQueue.length);
```

**Possible Causes:**
1. Queue management tidak berfungsi
2. Race condition saat refresh

**Solution:**
- Check `isRefreshing` flag
- Pastikan `processQueue()` dipanggil
- Check `failedQueue` array

## 📊 Monitoring Token Health

### Create a Token Status Screen

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { getTokenInfo, testTokenRefresh, clearAllTokenData } from '@/utils/tokenDebug';

export default function TokenStatusScreen() {
  const [info, setInfo] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadInfo = async () => {
    const tokenInfo = await getTokenInfo();
    setInfo(tokenInfo);
  };

  useEffect(() => {
    loadInfo();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await testTokenRefresh();
    await loadInfo();
    setRefreshing(false);
  };

  const handleClear = async () => {
    await clearAllTokenData();
    await loadInfo();
  };

  return (
    <ScrollView style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
        Token Status
      </Text>

      <View style={{ marginBottom: 20 }}>
        <Text>Has Access Token: {info?.hasToken ? '✅' : '❌'}</Text>
        <Text>Has Refresh Token: {info?.hasRefreshToken ? '✅' : '❌'}</Text>
        <Text>Is Expired: {info?.isExpired ? '❌' : '✅'}</Text>
        {info?.timeUntilExpiry && (
          <Text>Time Until Expiry: {info.timeUntilExpiry}</Text>
        )}
      </View>

      <Button title="Test Refresh" onPress={handleRefresh} disabled={refreshing} />
      <Button title="Reload Info" onPress={loadInfo} />
      <Button title="Clear All Tokens" onPress={handleClear} color="red" />
    </ScrollView>
  );
}
```

## 🔧 Backend Checklist

Pastikan backend sudah implement:

### 1. Token Expiry Configuration
```javascript
// Example (Node.js/Express)
const accessTokenExpiry = '15m'; // 15 minutes
const refreshTokenExpiry = '7d'; // 7 days
```

### 2. Refresh Endpoint
```javascript
// POST /auth/refresh
router.post('/auth/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  
  // Validate refresh token
  // Generate new access token
  // Optionally rotate refresh token
  
  res.json({
    success: true,
    data: {
      token: newAccessToken,
      refreshToken: newRefreshToken, // optional rotation
    },
  });
});
```

### 3. Auth Endpoints Return Refresh Token
```javascript
// POST /auth/login, /auth/register, /auth/google
res.json({
  success: true,
  data: {
    user: {...},
    token: accessToken,
    refreshToken: refreshToken, // MUST include this
  },
});
```

## 📝 Testing Checklist

- [ ] Login berhasil dan token tersimpan
- [ ] Refresh token tersimpan
- [ ] Token expiry tersimpan dan valid
- [ ] API calls menggunakan token
- [ ] Token auto-refresh sebelum expired
- [ ] 401 error trigger token refresh
- [ ] Refresh berhasil dan request di-retry
- [ ] Multiple concurrent requests di-queue
- [ ] Logout clear semua tokens
- [ ] Token info dapat di-debug dengan `printTokenInfo()`

## 🚨 Emergency Debug Commands

Jika app bermasalah dan perlu quick debug:

```typescript
// 1. Check token status
import { printTokenInfo } from '@/utils/tokenDebug';
await printTokenInfo();

// 2. Test refresh
import { testTokenRefresh } from '@/utils/tokenDebug';
await testTokenRefresh();

// 3. Clear everything and start fresh
import { clearAllTokenData } from '@/utils/tokenDebug';
await clearAllTokenData();

// 4. Check raw storage
import AsyncStorage from '@react-native-async-storage/async-storage';
const keys = await AsyncStorage.getAllKeys();
console.log('All keys:', keys);
```
