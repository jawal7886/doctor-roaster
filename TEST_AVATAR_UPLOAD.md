# Test Avatar Upload - Verification Guide

## Quick Test

### 1. Open Settings Page
- Navigate to: `http://localhost:5173/settings`
- Click on "Profile" tab

### 2. Upload Avatar
- Click the camera icon or "Choose File" button
- Select an image file (JPG, PNG, or GIF)
- Recommended test sizes:
  - Small: 50KB - 200KB
  - Medium: 200KB - 500KB
  - Large: 500KB - 2MB

### 3. Save Profile
- Click "Save Changes" button
- Wait for response

### 4. Expected Results
✅ Success toast: "Profile updated successfully"
✅ Avatar appears in profile section
✅ Avatar appears in top-right header
✅ No error messages

### 5. Verify Persistence
- Refresh the page (F5)
- Avatar should still be visible
- Check database:

```sql
SELECT id, name, LENGTH(avatar) as avatar_size 
FROM users 
WHERE id = 1;
```

## Test Different Image Sizes

### Test Case 1: Small Image (~100KB)
```
Expected: ✅ Success
Reason: Well within limits
```

### Test Case 2: Medium Image (~500KB)
```
Expected: ✅ Success
Reason: Within 2MB limit
```

### Test Case 3: Large Image (~1.5MB)
```
Expected: ✅ Success
Reason: Within 2MB limit
```

### Test Case 4: Too Large Image (>2MB)
```
Expected: ❌ Frontend validation error
Message: "File size must be less than 2MB"
Reason: Frontend prevents upload
```

## Verify in Database

### Check Avatar Stored
```sql
-- Check if avatar exists
SELECT 
    id, 
    name, 
    CASE 
        WHEN avatar IS NULL THEN 'No avatar'
        WHEN LENGTH(avatar) < 1000 THEN 'Very small'
        WHEN LENGTH(avatar) < 100000 THEN 'Small'
        WHEN LENGTH(avatar) < 500000 THEN 'Medium'
        ELSE 'Large'
    END as avatar_size_category,
    LENGTH(avatar) as avatar_bytes,
    ROUND(LENGTH(avatar)/1024, 2) as avatar_kb
FROM users 
WHERE id = 1;
```

### Check user_avatars Table
```sql
SELECT 
    user_id,
    filename,
    mime_type,
    file_size,
    ROUND(file_size/1024, 2) as size_kb,
    storage_type,
    created_at
FROM user_avatars 
WHERE user_id = 1;
```

## API Test (Optional)

### Using curl
```bash
curl -X PUT http://localhost:8000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "avatar": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }'
```

### Expected Response
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 1,
    "name": "Test User",
    "avatar": "data:image/png;base64,...",
    ...
  }
}
```

## Browser Console Check

### Open DevTools (F12)
1. Go to Console tab
2. Upload avatar
3. Check for errors

**Expected**: No red error messages

### Network Tab
1. Go to Network tab
2. Upload avatar and save
3. Find the PUT request to `/api/users/1`
4. Check response

**Expected**:
- Status: 200 OK
- Response: `{"success": true, ...}`

## Common Issues

### Issue: Still getting "Failed to update profile"
**Solution**:
1. Clear Laravel cache: `php artisan cache:clear`
2. Restart Laravel server
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try again

### Issue: Avatar not displaying
**Solution**:
1. Check if avatar was saved: `SELECT LENGTH(avatar) FROM users WHERE id = 1;`
2. Check browser console for errors
3. Verify UserContext is updating
4. Check AppHeader component

### Issue: "File size must be less than 2MB"
**Solution**:
- This is expected for files > 2MB
- Compress the image before uploading
- Use a smaller image

## Success Criteria

✅ Can upload images up to 2MB
✅ Avatar displays immediately after save
✅ Avatar persists after page refresh
✅ Avatar appears in header
✅ No console errors
✅ Database stores avatar correctly
✅ Both `users.avatar` and `user_avatars` table updated

## Performance Check

### Upload Time
- Small image (100KB): < 1 second
- Medium image (500KB): < 2 seconds
- Large image (1.5MB): < 3 seconds

If slower, consider:
- Network speed
- Server performance
- Database optimization

## Final Verification

Run this complete test:

1. ✅ Upload small image (100KB)
2. ✅ Save and verify
3. ✅ Upload medium image (500KB)
4. ✅ Save and verify
5. ✅ Upload large image (1.5MB)
6. ✅ Save and verify
7. ✅ Refresh page - avatar persists
8. ✅ Check database - avatar stored
9. ✅ Check header - avatar displays

If all steps pass: **✅ Avatar upload is working perfectly!**
