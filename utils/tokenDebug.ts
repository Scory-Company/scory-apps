import { getToken, getRefreshToken, isTokenExpired, getValidToken } from '@/services/tokenManager';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Token Debug Utilities
 * 
 * Helper functions untuk debugging token issues
 */

/**
 * Decode JWT token untuk melihat payload
 */
export function decodeJWT(token: string): any {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('[TokenDebug] Error decoding JWT:', error);
        return null;
    }
}

/**
 * Get comprehensive token info untuk debugging
 */
export async function getTokenInfo(): Promise<{
    hasToken: boolean;
    hasRefreshToken: boolean;
    isExpired: boolean;
    tokenPayload: any;
    expiryTime: Date | null;
    timeUntilExpiry: string | null;
}> {
    const token = await getToken();
    const refreshToken = await getRefreshToken();
    const expired = await isTokenExpired(0); // Check without buffer

    let tokenPayload = null;
    let expiryTime = null;
    let timeUntilExpiry = null;

    if (token) {
        tokenPayload = decodeJWT(token);

        if (tokenPayload?.exp) {
            expiryTime = new Date(tokenPayload.exp * 1000);
            const now = new Date();
            const diff = expiryTime.getTime() - now.getTime();

            if (diff > 0) {
                const minutes = Math.floor(diff / 60000);
                const hours = Math.floor(minutes / 60);
                const days = Math.floor(hours / 24);

                if (days > 0) {
                    timeUntilExpiry = `${days} hari ${hours % 24} jam`;
                } else if (hours > 0) {
                    timeUntilExpiry = `${hours} jam ${minutes % 60} menit`;
                } else {
                    timeUntilExpiry = `${minutes} menit`;
                }
            } else {
                timeUntilExpiry = 'Sudah expired';
            }
        }
    }

    return {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        isExpired: expired,
        tokenPayload,
        expiryTime,
        timeUntilExpiry,
    };
}

/**
 * Print token info ke console
 */
export async function printTokenInfo(): Promise<void> {
    console.log('\n========== TOKEN DEBUG INFO ==========');

    const info = await getTokenInfo();

    console.log('Has Access Token:', info.hasToken);
    console.log('Has Refresh Token:', info.hasRefreshToken);
    console.log('Is Expired:', info.isExpired);

    if (info.expiryTime) {
        console.log('Expiry Time:', info.expiryTime.toLocaleString('id-ID'));
        console.log('Time Until Expiry:', info.timeUntilExpiry);
    }

    if (info.tokenPayload) {
        console.log('\nToken Payload:');
        console.log('- User ID:', info.tokenPayload.userId || info.tokenPayload.sub);
        console.log('- Email:', info.tokenPayload.email);
        console.log('- Issued At:', new Date((info.tokenPayload.iat || 0) * 1000).toLocaleString('id-ID'));
    }

    console.log('======================================\n');
}

/**
 * Test token refresh
 */
export async function testTokenRefresh(): Promise<boolean> {
    console.log('\n========== TESTING TOKEN REFRESH ==========');

    try {
        const beforeInfo = await getTokenInfo();
        console.log('Before Refresh:');
        console.log('- Has Token:', beforeInfo.hasToken);
        console.log('- Is Expired:', beforeInfo.isExpired);
        console.log('- Time Until Expiry:', beforeInfo.timeUntilExpiry);

        console.log('\nAttempting refresh...');
        const newToken = await getValidToken();

        if (newToken) {
            const afterInfo = await getTokenInfo();
            console.log('\nAfter Refresh:');
            console.log('- Has Token:', afterInfo.hasToken);
            console.log('- Is Expired:', afterInfo.isExpired);
            console.log('- Time Until Expiry:', afterInfo.timeUntilExpiry);
            console.log('\n✅ Token refresh successful!');
            console.log('===========================================\n');
            return true;
        } else {
            console.log('\n❌ Token refresh failed!');
            console.log('===========================================\n');
            return false;
        }
    } catch (error) {
        console.error('\n❌ Error during token refresh:', error);
        console.log('===========================================\n');
        return false;
    }
}

/**
 * Clear all token data (untuk testing)
 */
export async function clearAllTokenData(): Promise<void> {
    console.log('\n========== CLEARING ALL TOKEN DATA ==========');

    await AsyncStorage.multiRemove([
        'token',
        'refreshToken',
        'tokenExpiry',
        'user',
    ]);

    console.log('✅ All token data cleared');
    console.log('=============================================\n');
}

/**
 * Simulate token expiry (untuk testing)
 * WARNING: Ini akan merusak token, hanya untuk testing!
 */
export async function simulateTokenExpiry(): Promise<void> {
    console.log('\n========== SIMULATING TOKEN EXPIRY ==========');
    console.warn('⚠️  WARNING: This will corrupt your token!');

    // Set expiry to past time
    const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour ago
    await AsyncStorage.setItem('tokenExpiry', pastTime.toString());

    console.log('✅ Token expiry simulated (set to 1 hour ago)');
    console.log('=============================================\n');
}

export default {
    decodeJWT,
    getTokenInfo,
    printTokenInfo,
    testTokenRefresh,
    clearAllTokenData,
    simulateTokenExpiry,
};
