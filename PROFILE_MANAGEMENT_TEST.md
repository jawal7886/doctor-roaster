# User Profile Management - Testing Guide

## Test Environment Setup

### Prerequisites
1. Backend server running: `php artisan serve` in backend directory
2. Frontend dev server running: `npm run dev` in root directory
3. Database seeded with test data
4. At least one user logged in (via UserContext)

## Manual Testing Steps

### Test 1: Profile Data Loading
**Objective**: Verify profile data loads correctly from UserContext

1. Navigate to Settings page (`/settings`)
2. Click on "Profile" tab (should be default)
3. **Expected Results**:
   - Full Name field shows current user's name
   - Email field shows current user's email
   - Phone field shows current user's phone
   - Role dropdown shows current user's role
   - Avatar shows user's image or initials

**Pass Criteria**: All fields populated with correct user data

---

### Test 2: Avatar Upload - Valid File
**Objective**: Test avatar upload with valid image file

1. On Profile tab, click camera icon or "Choose File" button
2. Select a valid image file (JPG/PNG, < 2MB)
3. **Expected Results**:
   - File picker opens
   - After selection, avatar preview updates immediately
   - No error messages appear
   - Avatar shows the uploaded image

**Pass Criteria**: Avatar preview updates with selected image

---

### Test 3: Avatar Upload - File Too Large
**Objective**: Test file size validation

1. On Profile tab, click camera icon or "Choose File" button
2. Select an image file > 2MB
3. **Expected Results**:
   - Error toast appears: "File size must be less than 2MB"
   - Avatar preview does not change
   - Previous avatar remains visible

**Pass Criteria**: Error message shown, upload rejected

---

### Test 4: Edit Profile Information
**Objective**: Test form field editing

1. On Profile tab, modify the following fields:
   - Change Full Name to "Test User Updated"
   - Change Email to "test.updated@hospital.com"
   - Change Phone to "+1-555-9999"
   - Select a different role from dropdown
2. **Expected Results**:
   - All fields accept input
   - Changes are visible in real-time
   - No errors or console warnings

**Pass Criteria**: All fields editable and responsive

---

### Test 5: Save Profile Changes
**Objective**: Test profile update API integration

1. Make changes to profile fields (name, email, phone, role)
2. Upload a new avatar (optional)
3. Click "Save Changes" button
4. **Expected Results**:
   - Success toast appears: "Profile updated successfully"
   - No error messages
   - Changes persist after page refresh
   - AppHeader updates with new name/avatar
   - Network tab shows PUT request to `/api/users/{id}`

**Pass Criteria**: Profile saves successfully, UI updates

---

### Test 6: Save Without Changes
**Objective**: Test save with no modifications

1. On Profile tab, don't modify any fields
2. Click "Save Changes" button
3. **Expected Results**:
   - Success toast appears
   - No errors
   - API call still made (idempotent)

**Pass Criteria**: Save completes without errors

---

### Test 7: Role Dropdown Population
**Objective**: Verify roles load from API

1. On Profile tab, click the Role dropdown
2. **Expected Results**:
   - Dropdown opens
   - Shows list of available roles (Admin, Doctor, Nurse, etc.)
   - Current role is pre-selected
   - All roles are clickable

**Pass Criteria**: Roles populate from API correctly

---

### Test 8: Avatar in AppHeader
**Objective**: Verify avatar updates in header

1. Upload a new avatar in Profile tab
2. Click "Save Changes"
3. Look at the top-right corner of the page (AppHeader)
4. **Expected Results**:
   - AppHeader avatar updates to new image
   - User name updates if changed
   - Role display updates if changed

**Pass Criteria**: AppHeader reflects profile changes

---

### Test 9: Error Handling - Network Failure
**Objective**: Test error handling when API fails

1. Stop the backend server
2. Make changes to profile
3. Click "Save Changes"
4. **Expected Results**:
   - Error toast appears: "Failed to update profile"
   - Changes not saved
   - Form remains editable
   - No console errors crash the app

**Pass Criteria**: Graceful error handling

---

### Test 10: Responsive Design
**Objective**: Test UI on different screen sizes

1. Open Settings page on desktop (> 1024px)
2. Resize browser to tablet size (768px - 1024px)
3. Resize to mobile size (< 768px)
4. **Expected Results**:
   - Profile form adapts to screen size
   - Fields stack vertically on mobile
   - Avatar remains visible and functional
   - All buttons accessible
   - No horizontal scrolling

**Pass Criteria**: UI responsive on all screen sizes

---

## Automated Testing (Future)

### Unit Tests
```typescript
// Test avatar upload validation
test('rejects files larger than 2MB', () => {
  // Mock file > 2MB
  // Trigger upload
  // Assert error toast shown
});

// Test profile save
test('calls updateUser API with correct data', async () => {
  // Mock API
  // Fill form
  // Click save
  // Assert API called with correct payload
});
```

### Integration Tests
```typescript
// Test full profile update flow
test('updates profile and refreshes UI', async () => {
  // Navigate to settings
  // Edit profile
  // Save changes
  // Assert UI updates
  // Assert API called
});
```

## API Testing

### Test Profile Update Endpoint
```bash
# Test with curl
curl -X PUT http://localhost:8000/api/users/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@hospital.com",
    "phone": "+1-555-0000",
    "role_id": 1,
    "avatar": "data:image/png;base64,..."
  }'
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Test User",
    "email": "test@hospital.com",
    "phone": "+1-555-0000",
    "role_id": 1,
    "avatar": "data:image/png;base64,...",
    ...
  }
}
```

## Browser Console Checks

### No Errors
- Open browser DevTools (F12)
- Navigate to Settings page
- Check Console tab
- **Expected**: No red error messages

### Network Requests
- Open Network tab
- Edit and save profile
- **Expected Requests**:
  - GET `/api/roles` (on page load)
  - GET `/api/specialties` (on page load)
  - PUT `/api/users/{id}` (on save)
  - All return 200 status

### React DevTools
- Install React DevTools extension
- Check UserContext state
- **Expected**: currentUser updates after save

## Performance Checks

### Image Upload Performance
- Upload 1.9MB image (near limit)
- **Expected**: Preview appears within 1 second

### Save Performance
- Click "Save Changes"
- **Expected**: Toast appears within 2 seconds

## Accessibility Testing

### Keyboard Navigation
1. Tab through profile form
2. **Expected**: All fields focusable in logical order

### Screen Reader
1. Use screen reader (NVDA/JAWS)
2. **Expected**: All labels read correctly

### Color Contrast
1. Check text contrast ratios
2. **Expected**: WCAG AA compliance

## Security Testing

### XSS Prevention
- Try entering `<script>alert('xss')</script>` in name field
- **Expected**: Sanitized, no script execution

### File Type Validation
- Try uploading .exe or .pdf file
- **Expected**: Only images accepted

## Test Results Template

```
Test Date: ___________
Tester: ___________
Environment: Dev / Staging / Production

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Profile Data Loading | ☐ Pass ☐ Fail | |
| 2 | Avatar Upload - Valid | ☐ Pass ☐ Fail | |
| 3 | Avatar Upload - Too Large | ☐ Pass ☐ Fail | |
| 4 | Edit Profile Info | ☐ Pass ☐ Fail | |
| 5 | Save Profile Changes | ☐ Pass ☐ Fail | |
| 6 | Save Without Changes | ☐ Pass ☐ Fail | |
| 7 | Role Dropdown | ☐ Pass ☐ Fail | |
| 8 | Avatar in AppHeader | ☐ Pass ☐ Fail | |
| 9 | Error Handling | ☐ Pass ☐ Fail | |
| 10 | Responsive Design | ☐ Pass ☐ Fail | |

Overall Status: ☐ All Pass ☐ Some Failures

Issues Found:
1. ___________
2. ___________
```

## Known Limitations

1. **Avatar Storage**: Stored as base64 in database (not ideal for production)
2. **File Size**: 2MB limit may be too small for high-res images
3. **No Cropping**: Users can't crop/resize images before upload
4. **No Validation**: Email format validated but not verified
5. **Role Changes**: No approval workflow for role changes

## Recommendations

1. Implement image optimization/compression
2. Add avatar cropping tool
3. Add email verification flow
4. Add role change approval for non-admins
5. Store avatars in cloud storage (S3, Cloudinary)
6. Add profile completion indicator
7. Add password change functionality
8. Add activity log for profile changes
