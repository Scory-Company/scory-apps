# Insight Detail Feature

## 📋 Overview

Fitur detail insight yang memungkinkan user untuk melihat, mengedit, dan menghapus notes mereka dengan tampilan yang lebih lengkap.

## ✨ Features

### 1. View Insight Detail
- **Full Content Display** - Menampilkan isi note secara lengkap
- **Article Link** - Jika note terkait artikel, menampilkan link ke artikel tersebut
- **Metadata Info** - Menampilkan tanggal created, last edited, dan tipe note
- **Relative Time** - Format waktu yang user-friendly (Today, Yesterday, 3 days ago, etc.)

### 2. Edit Note
- **In-place Editing** - Edit langsung di halaman detail
- **Character Counter** - Menampilkan jumlah karakter saat edit
- **Auto-save** - Menyimpan perubahan ke backend
- **Validation** - Validasi content tidak boleh kosong

### 3. Delete Note
- **Confirmation Dialog** - Konfirmasi sebelum menghapus
- **Optimistic Update** - Langsung kembali ke halaman sebelumnya setelah delete
- **Error Handling** - Handle error jika delete gagal

## 📁 Files Created/Modified

### New Files:
1. **[app/insight/[id].tsx](../app/insight/[id].tsx)** - Insight detail screen

### Modified Files:
2. **[app/(tabs)/learn.tsx](../app/(tabs)/learn.tsx)** - Updated to navigate to detail screen

## 🎨 UI Components

### Screen Layout:
```
┌─────────────────────────────────┐
│ ← Back     Note Details   ✏️ 🗑️ │  <- Header with actions
├─────────────────────────────────┤
│                                 │
│ 📄 From Article                 │  <- Article link (if article note)
│    Article Title                │
│    >                            │
│                                 │
│ Note content here...            │  <- Full note content
│ Can be multiple lines           │
│                                 │
│ ⏱️  Created: 2 days ago         │  <- Metadata
│ ✏️  Last edited: Today          │
│ 🏷️  Type: Article Note          │
│                                 │
└─────────────────────────────────┘
```

### Edit Mode:
```
┌─────────────────────────────────┐
│ ← Back     Note Details   Cancel│  <- Cancel edit
├─────────────────────────────────┤
│                                 │
│ Edit your note                  │
│ ┌─────────────────────────────┐ │
│ │ Editable text area          │ │  <- Multiline input
│ │                             │ │
│ │                             │ │
│ └─────────────────────────────┘ │
│ 234 characters                  │  <- Char counter
│                                 │
└─────────────────────────────────┘
│ ✓ Save Changes                  │  <- Save button (footer)
└─────────────────────────────────┘
```

## 🔄 User Flow

### View Detail:
1. User clicks insight card di Learn screen
2. Navigate to `/insight/{noteId}`
3. Screen load note detail dari API
4. Tampilkan full content + metadata

### Edit Note:
1. User click edit icon (✏️) di header
2. Screen masuk edit mode
3. Content menjadi editable TextInput
4. User edit content
5. User click "Save Changes"
6. API update note
7. Screen kembali ke view mode
8. Tampilkan updated content

### Delete Note:
1. User click delete icon (🗑️) di header
2. Tampilkan confirmation dialog
3. User confirm delete
4. API delete note
5. Screen navigate back ke Learn screen
6. Learn screen refresh untuk remove deleted note

### Navigate to Article (if article note):
1. User click article card
2. Navigate to `/article/{articleSlug}`

## 🛠️ API Integration

### Get Note Detail:
```typescript
// GET /api/v1/notes/:id
const response = await notesApi.getNoteById(noteId);

// Response:
{
  success: true,
  data: {
    id: "uuid-string",
    content: "Note content",
    articleId: "article-id" | null,
    articleTitle: "Article Title" | null,
    articleSlug: "article-slug" | null,
    createdAt: "2024-12-10T10:00:00Z",
    updatedAt: "2024-12-10T11:00:00Z",
    ...
  }
}
```

### Update Note:
```typescript
// PUT /api/v1/notes/:id
const response = await notesApi.updateNote(noteId, {
  content: "Updated content"
});

// Response:
{
  success: true,
  message: "Note updated successfully",
  data: { /* updated note */ }
}
```

### Delete Note:
```typescript
// DELETE /api/v1/notes/:id
const response = await notesApi.deleteNote(noteId);

// Response:
{
  success: true,
  message: "Note deleted successfully"
}
```

## 📱 Navigation

### Route:
- **Path:** `/insight/[id]`
- **Dynamic param:** `id` (note UUID)

### Navigate from Learn screen:
```typescript
router.push(`/insight/${insight.id}` as any);
```

### Navigate back:
```typescript
router.back();
```

## 🎯 Features Breakdown

### 1. Loading State
- Tampilkan spinner + "Loading note..." saat fetch data
- Disable interactions during loading

### 2. Error State
- Tampilkan error icon + message jika gagal load
- Button "Try Again" untuk retry fetch
- Handle 404, 403, 500 errors

### 3. Header Actions
- **Back button:** Navigate back
- **Edit button:** Enter edit mode (only in view mode)
- **Delete button:** Delete note with confirmation (only in view mode)
- **Cancel button:** Exit edit mode (only in edit mode)

### 4. Article Info Card (conditional)
- Hanya tampil jika `insight.articleSlug !== null`
- Clickable card → navigate to article detail
- Tampilkan article icon, label, title, dan chevron

### 5. Content Display
- **View mode:** Plain text dengan line breaks
- **Edit mode:** Multiline TextInput dengan auto-focus
- Min height 200px untuk comfortable editing

### 6. Metadata Section
- **Created date:** Format relative time
- **Last edited:** Only show if `updatedAt !== createdAt`
- **Note type:** "Article Note" atau "Standalone Note"

### 7. Save Button Footer (edit mode)
- Fixed di bottom screen
- Disabled jika content kosong atau sedang saving
- Show loading spinner saat saving

## 🎨 Styling

### Colors:
- Background: `colors.background`
- Surface: `colors.surface`
- Text: `colors.text`
- Secondary text: `colors.textSecondary`
- Primary: `colors.primary`
- Error: `colors.error`
- Border: `colors.border`

### Spacing:
- Padding: `Spacing.lg`, `Spacing.md`, `Spacing.sm`
- Gaps: `Spacing.md` between sections
- Border radius: `BorderRadius.lg`, `BorderRadius.md`

### Typography:
- Header title: `fontSize.lg`, weight 600
- Content text: `fontSize.base`, line height 24
- Metadata: `fontSize.sm`
- Labels: `fontSize.xs`

## 🔒 Security & Validation

### Input Validation:
- Content tidak boleh empty (show alert)
- Minimum 1 character
- Maximum handled by backend (10000 chars)

### Error Handling:
- Network errors → Show error message
- 404 Not Found → "Note not found"
- 403 Forbidden → "Not authorized"
- 500 Server Error → "Failed to load note"

### Authorization:
- Backend check user owns the note
- Frontend shows 403 error jika unauthorized

## 📊 State Management

### Local State:
```typescript
const [insight, setInsight] = useState<Note | null>(null);
const [isLoading, setIsLoading] = useState(true);
const [isEditing, setIsEditing] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [isDeleting, setIsDeleting] = useState(false);
const [editedContent, setEditedContent] = useState('');
const [error, setError] = useState<string | null>(null);
```

### URL Params:
```typescript
const { id } = useLocalSearchParams<{ id: string }>();
```

## 🚀 Usage Examples

### Navigate to detail:
```typescript
// From Learn screen
<InsightCard
  insight={insight}
  onPress={() => router.push(`/insight/${insight.id}` as any)}
/>
```

### Update note:
```typescript
const handleSave = async () => {
  const response = await notesApi.updateNote(id, {
    content: editedContent.trim()
  });

  if (response.success) {
    setInsight(response.data);
    setIsEditing(false);
    Alert.alert('Success', 'Note updated successfully');
  }
};
```

### Delete note:
```typescript
const handleDelete = async () => {
  const response = await notesApi.deleteNote(id);

  if (response.success) {
    Alert.alert('Success', 'Note deleted successfully', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  }
};
```

## 🐛 Known Issues & Future Improvements

### Current Limitations:
- Tidak ada undo/redo saat edit
- Tidak ada autosave (harus manual click save)
- Tidak ada draft saving jika user cancel edit

### Future Enhancements:
- [ ] Undo/redo functionality
- [ ] Autosave draft ke local storage
- [ ] Rich text editor support
- [ ] Image/attachment support
- [ ] Share note functionality
- [ ] Export to PDF/Markdown
- [ ] Tags/categories for notes
- [ ] Search within note

## 📚 Related Documentation

- **API Docs:** [API_NOTES.md](./API_NOTES.md)
- **Notes API Migration:** [NOTES_API_MIGRATION.md](./NOTES_API_MIGRATION.md)
- **Testing Guide:** [../scripts/README_TEST.md](../scripts/README_TEST.md)

## ✅ Testing Checklist

### Manual Testing:
- [ ] Click insight card dari Learn screen → navigate to detail
- [ ] View full note content
- [ ] View article link (for article notes)
- [ ] Click article link → navigate to article
- [ ] Click edit button → enter edit mode
- [ ] Edit content → save → verify updated
- [ ] Click cancel → verify content reverted
- [ ] Try save empty content → verify validation
- [ ] Click delete → confirm → verify deleted
- [ ] Back button → return to Learn screen
- [ ] Test with standalone note (no article link)
- [ ] Test with very long content
- [ ] Test loading state
- [ ] Test error state (invalid ID, network error)

### Edge Cases:
- [ ] Note doesn't exist (404)
- [ ] User not authorized (403)
- [ ] Network timeout
- [ ] Deleted by another device
- [ ] Very long article title (ellipsis)
- [ ] Very old note (date formatting)

---

**Feature Completed:** ✅
**Last Updated:** 2024-12-10
**Status:** Production Ready
