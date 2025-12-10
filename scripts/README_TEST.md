# Notes API Testing Guide

Panduan untuk testing Notes API sebelum diimplementasikan ke frontend.

## 📋 Persiapan

### 1. Dapatkan JWT Token

Pertama, Anda perlu mendapatkan JWT token dengan cara login:

```bash
# Login untuk mendapatkan token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-email@example.com",
    "password": "your-password"
  }'
```

Copy JWT token dari response dan simpan untuk digunakan di script testing.

### 2. Pastikan Backend Running

```bash
# Pastikan backend server berjalan di port 5000
# Check dengan:
curl http://localhost:5000/api/v1/health
```

---

## 🚀 Cara Menjalankan Testing

### Opsi 1: Node.js (RECOMMENDED untuk Windows)

**Kelebihan:**
- ✅ Cross-platform (Windows, Mac, Linux)
- ✅ Mudah di-debug
- ✅ Output yang jelas dan berwarna

**Cara pakai:**

1. Edit file `test-notes-api.js`, masukkan token Anda:
   ```javascript
   const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // <-- Paste token di sini
   ```

2. Jalankan script:
   ```bash
   node scripts/test-notes-api.js
   ```

### Opsi 2: PowerShell (untuk Windows)

**Cara pakai:**

1. Edit file `test-notes-api.ps1`, masukkan token Anda:
   ```powershell
   $TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # <-- Paste token di sini
   ```

2. Jalankan script:
   ```powershell
   .\scripts\test-notes-api.ps1
   ```

### Opsi 3: Bash (untuk Linux/Mac/Git Bash)

**Cara pakai:**

1. Edit file `test-notes-api.sh`, masukkan token Anda:
   ```bash
   TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." # <-- Paste token di sini
   ```

2. Berikan permission execute:
   ```bash
   chmod +x scripts/test-notes-api.sh
   ```

3. Jalankan script:
   ```bash
   ./scripts/test-notes-api.sh
   ```

---

## 📝 Test Yang Dilakukan

Script akan menjalankan 11 test secara berurutan:

1. ✅ **Create Standalone Note** - Membuat note mandiri dengan title & content
2. ✅ **Create Article Note** - Membuat note yang terkait dengan artikel
3. ✅ **Get All Notes** - Mengambil semua notes user
4. ✅ **Get Standalone Notes Only** - Filter hanya standalone notes
5. ✅ **Get Notes by Article Slug** - Filter notes berdasarkan artikel
6. ✅ **Get Single Note by ID** - Mengambil detail satu note
7. ✅ **Update Standalone Note** - Update title dan content
8. ✅ **Update Article Note** - Update content saja
9. ✅ **Delete Article Note** - Hapus article note
10. ✅ **Verify Deletion** - Pastikan note terhapus (expect 404)
11. ✅ **Delete Standalone Note** - Cleanup standalone note

---

## 🔍 Membaca Output

### ✅ Test Berhasil
```
============================================
TEST 1: Create Standalone Note
============================================

Creating standalone note with title and content...
HTTP Status: 201
Response:
{
  "success": true,
  "message": "Note created successfully",
  "data": { ... }
}
✓ Standalone note created successfully
Note ID: 550e8400-e29b-41d4-a716-446655440000
```

### ❌ Test Gagal
```
HTTP Status: 400
Response:
{
  "success": false,
  "message": "Content is required"
}
✗ Failed to create standalone note
```

---

## 🐛 Debugging

### Jika Test Gagal

1. **Check Backend Logs**
   - Lihat console backend untuk error details
   - Pastikan database connection OK

2. **Check Token**
   - Pastikan token valid dan belum expired
   - Login ulang jika perlu

3. **Check Base URL**
   - Pastikan backend running di `http://localhost:5000`
   - Sesuaikan `BASE_URL` jika berbeda

4. **Check Article Slug**
   - Default: `quantum-computing-basics`
   - Pastikan artikel ini ada di database
   - Atau ganti dengan slug yang valid

### Test Individual Endpoint

Anda juga bisa test endpoint secara manual:

```bash
# Test Create Note
curl -X POST http://localhost:5000/api/v1/notes \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Note",
    "content": "This is a test"
  }'

# Test Get All Notes
curl -X GET http://localhost:5000/api/v1/notes \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test Get Standalone Notes
curl -X GET "http://localhost:5000/api/v1/notes?standalone=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 📊 Expected Results

Setelah semua test selesai, Anda akan melihat:

```
============================================
TESTING COMPLETE
============================================

All tests have been executed!

Next steps:
1. Review the test results above
2. If all tests passed, the API is ready for frontend integration
3. If any tests failed, check the backend logs for details
```

**Jika semua test PASSED:**
- ✅ API siap diintegrasikan ke frontend
- ✅ Lanjut update service files di frontend

**Jika ada test FAILED:**
- ❌ Check backend logs untuk error details
- ❌ Fix backend issues dulu sebelum lanjut frontend
- ❌ Re-run test setelah fix

---

## 🔄 Next Steps: Frontend Integration

Setelah semua test PASSED, lanjut ke:

1. **Update Service Files**
   - `services/insightsApi.ts` → Ganti ke unified notes API
   - `services/standaloneNotesApi.ts` → Ganti ke unified notes API

2. **Update Hooks**
   - `hooks/useInsights.ts` → Sesuaikan dengan API baru
   - `hooks/useUserInsights.ts` → Sesuaikan dengan API baru

3. **Update Components**
   - Test di UI bahwa notes berfungsi dengan baik
   - Pastikan create, read, update, delete works

---

## 📚 Reference

- API Documentation: `docs/API_NOTES.md`
- Backend Implementation: Check backend repository
- Frontend Services: `services/*.ts`

---

## ⚠️ Notes

- Script akan membuat dan menghapus test data
- Tidak akan mempengaruhi data production (jika test di local)
- Pastikan database dalam keadaan seeder/test mode
- Token akan expired setelah beberapa waktu (sesuai backend config)

---

## 💡 Tips

1. **Simpan Token di Environment Variable**
   ```bash
   # Windows PowerShell
   $env:SCORY_TOKEN="your-token-here"

   # Linux/Mac/Git Bash
   export SCORY_TOKEN="your-token-here"
   ```

2. **Run Multiple Times**
   - Test berkali-kali untuk ensure consistency
   - Check for race conditions atau timing issues

3. **Monitor Backend**
   - Buka terminal terpisah untuk backend logs
   - Monitor database queries jika perlu

---

Happy Testing! 🎉
