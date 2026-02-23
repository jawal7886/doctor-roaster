# Avatar Storage - Quick Reference Guide

## 🎯 Quick Facts

- ✅ **Table**: `user_avatars`
- ✅ **Storage**: Base64 in database (LONGTEXT)
- ✅ **Limit**: 2MB per image
- ✅ **Formats**: JPG, PNG, GIF
- ✅ **Relationship**: One avatar per user
- ✅ **Auto-delete**: Cascade when user deleted

## 📊 Table Structure (Simple View)

```
user_avatars
├── id              → Unique ID
├── user_id         → Which user (UNIQUE)
├── filename        → avatar_1_1234567890.png
├── mime_type       → image/png
├── file_size       → 12345 (bytes)
├── base64_data     → data:image/png;base64,...
└── storage_type    → base64
```

## 🔍 Common Queries

### See all avatars
```sql
SELECT user_id, filename, file_size FROM user_avatars;
```

### Get specific user's avatar
```sql
SELECT * FROM user_avatars WHERE user_id = 1;
```

### Count total avatars
```sql
SELECT COUNT(*) FROM user_avatars;
```

### Total storage used
```sql
SELECT ROUND(SUM(file_size)/1024/1024, 2) as MB FROM user_avatars;
```

### Users with avatars
```sql
SELECT u.name, ua.filename 
FROM users u 
JOIN user_avatars ua ON u.id = ua.user_id;
```

### Users without avatars
```sql
SELECT u.name 
FROM users u 
LEFT JOIN user_avatars ua ON u.id = ua.user_id 
WHERE ua.id IS NULL;
```

## 🔧 How to Use (Frontend)

### 1. Upload Avatar
```typescript
// In Settings page
const handleAvatarChange = (e) => {
  const file = e.target.files?.[0];
  const reader = new FileReader();
  reader.onloadend = () => {
    setProfileAvatar(reader.result); // base64 string
  };
  reader.readAsDataURL(file);
};
```

### 2. Save Profile
```typescript
await updateUser(userId, {
  name: profileName,
  avatar: profileAvatar, // base64 string
});
```

### 3. Display Avatar
```typescript
// Avatar automatically appears in:
// - Settings page (profile tab)
// - AppHeader (top right)
// - User lists
```

## 🔧 How to Use (Backend)

### Get User with Avatar
```php
$user = User::with('userAvatar')->find($id);
$avatarUrl = $user->avatar_url; // Uses accessor
```

### Update Avatar
```php
// Automatically handled in UserController::update()
// Just send avatar in request body
```

### Delete Avatar
```php
UserAvatar::where('user_id', $userId)->delete();
```

## 📈 Monitoring

### Check table size
```bash
cd backend
php artisan tinker --execute="
  echo 'Avatars: ' . \App\Models\UserAvatar::count() . PHP_EOL;
  echo 'Total MB: ' . round(\App\Models\UserAvatar::sum('file_size')/1024/1024, 2);
"
```

### View recent uploads
```sql
SELECT user_id, filename, created_at 
FROM user_avatars 
ORDER BY created_at DESC 
LIMIT 10;
```

## 🐛 Troubleshooting

### Avatar not saving?
1. Check migration: `php artisan migrate:status`
2. Check table exists: `SHOW TABLES LIKE 'user_avatars';`
3. Check base64 format is correct
4. Check file size < 2MB

### Avatar not displaying?
1. Check if avatar exists: `SELECT * FROM user_avatars WHERE user_id = ?;`
2. Check API response includes avatar field
3. Check frontend receives avatar data
4. Check browser console for errors

### Database too large?
1. Check total size: `SELECT SUM(file_size) FROM user_avatars;`
2. Find large avatars: `SELECT * FROM user_avatars ORDER BY file_size DESC LIMIT 10;`
3. Consider switching to local/S3 storage
4. Implement image compression

## 📝 API Endpoints

### Update User (includes avatar)
```
PUT /api/users/{id}
Body: {
  "name": "John Smith",
  "avatar": "data:image/png;base64,..."
}
```

### Get User (includes avatar)
```
GET /api/users/{id}
Response: {
  "id": 1,
  "name": "John Smith",
  "avatar": "data:image/png;base64,...",
  ...
}
```

## 🎨 Storage Types

| Type | Status | Description |
|------|--------|-------------|
| **base64** | ✅ Active | Stored in database |
| **local** | 🔜 Future | Stored in file system |
| **s3** | 🔜 Future | Stored in Amazon S3 |
| **cloudinary** | 🔜 Future | Stored in Cloudinary |

## 📚 Full Documentation

For complete details, see:
- `AVATAR_STORAGE_SYSTEM.md` - Technical docs
- `AVATAR_FIX_COMPLETE.md` - Implementation details
- `AVATAR_DATABASE_QUERIES.md` - SQL reference
- `AVATAR_IMPLEMENTATION_SUMMARY.md` - Complete summary

## ⚡ Quick Commands

```bash
# Check migration status
php artisan migrate:status

# View table structure
php artisan tinker --execute="
  echo DB::select('SHOW CREATE TABLE user_avatars')[0]->{'Create Table'};
"

# Count avatars
php artisan tinker --execute="
  echo \App\Models\UserAvatar::count();
"

# Total storage
php artisan tinker --execute="
  echo round(\App\Models\UserAvatar::sum('file_size')/1024/1024, 2) . ' MB';
"
```

## ✅ Status

**Everything is working!**
- ✅ Table created
- ✅ Models configured
- ✅ Controller updated
- ✅ API working
- ✅ Frontend integrated
- ✅ Documentation complete

**Ready for production use!** 🚀
