# User Profile Management - Quick Start Guide

## For Developers

### How to Use the Profile Feature

#### 1. Navigate to Settings
```typescript
// In your app
navigate('/settings');
// Or click "Settings" in the sidebar
```

#### 2. Access Current User
```typescript
import { useUser } from '@/contexts/UserContext';

const { currentUser, updateCurrentUser } = useUser();
```

#### 3. Update Profile Programmatically
```typescript
import { updateUser } from '@/services/userService';

const updatedUser = await updateUser(userId, {
  name: 'New Name',
  email: 'new@email.com',
  phone: '+1-555-0000',
  roleId: 1,
  avatar: 'data:image/png;base64,...'
});

// Update context
updateCurrentUser(updatedUser);
```

#### 4. Upload Avatar
```typescript
const handleAvatarUpload = (file: File) => {
  const reader = new FileReader();
  reader.onloadend = () => {
    const base64 = reader.result as string;
    // Use base64 string in updateUser call
  };
  reader.readAsDataURL(file);
};
```

## For Users

### How to Update Your Profile

1. **Open Settings**
   - Click "Settings" in the left sidebar
   - Or navigate to `/settings`

2. **Edit Profile Picture**
   - Click the camera icon on your avatar
   - Or click "Choose File" button
   - Select an image (JPG, PNG, GIF)
   - Max size: 2MB
   - Preview appears immediately

3. **Edit Information**
   - Update your name, email, or phone
   - Change your role (if permitted)
   - All fields update in real-time

4. **Save Changes**
   - Click "Save Changes" button
   - Wait for success message
   - Changes appear immediately in header

## API Reference

### Update User Profile
```http
PUT /api/users/{id}
Content-Type: application/json

{
  "name": "string",
  "email": "string",
  "phone": "string",
  "role_id": number,
  "avatar": "string (base64)"
}
```

### Response
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Smith",
    "email": "john@hospital.com",
    "phone": "+1-555-0110",
    "role_id": 1,
    "roleDisplay": "Administrator",
    "avatar": "data:image/png;base64,...",
    "department": {...},
    "role": {...},
    "specialty": {...}
  }
}
```

## Common Issues

### Avatar Not Showing
- Check file size (< 2MB)
- Verify file type (image only)
- Check browser console for errors

### Save Fails
- Verify backend is running
- Check network tab for API errors
- Ensure user is logged in (UserContext)

### Changes Don't Persist
- Check if save was successful (toast message)
- Verify API response in network tab
- Refresh page to confirm

## File Locations

```
Frontend:
├── src/pages/SettingsPage.tsx          # Main settings page
├── src/contexts/UserContext.tsx        # User state management
├── src/services/userService.ts         # API calls
└── src/components/layout/AppHeader.tsx # Header with avatar

Backend:
├── app/Http/Controllers/Api/UserController.php  # API endpoints
├── app/Models/User.php                          # User model
└── routes/api.php                               # API routes
```

## Quick Commands

```bash
# Start backend
cd backend && php artisan serve

# Start frontend
npm run dev

# Check routes
cd backend && php artisan route:list --path=api/users

# Clear cache
cd backend && php artisan cache:clear
```

## Support

For issues or questions:
1. Check PROFILE_MANAGEMENT_TEST.md for testing guide
2. Review USER_PROFILE_MANAGEMENT.md for detailed docs
3. Check browser console for errors
4. Verify API responses in network tab
