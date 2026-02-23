# Hospital Settings Management Feature

## Overview
Implemented a complete hospital settings management system that allows administrators to customize the hospital name and logo from the Settings page. The hospital name and logo are displayed dynamically in the sidebar and throughout the application.

## Backend Implementation

### API Endpoints
- `GET /api/hospital-settings` - Get current hospital settings
- `PUT /api/hospital-settings` - Update hospital settings

### Controller
- `HospitalSettingController` - Manages hospital settings CRUD operations
  - Handles logo upload as base64 encoded images
  - Validates file size (max 2MB)
  - Creates default settings if none exist

### Database
Uses existing `hospital_settings` table with fields:
- `hospital_name` - Name of the hospital
- `hospital_address` - Hospital address
- `hospital_phone` - Contact phone number
- `hospital_logo` - Base64 encoded logo image
- `max_weekly_hours` - Default maximum weekly hours for staff

## Frontend Implementation

### Context Provider
- `HospitalSettingsContext` - Global state management for hospital settings
  - Loads settings on app initialization
  - Provides `refreshSettings()` function to reload settings
  - Makes settings available throughout the app via `useHospitalSettings()` hook

### Services
- `hospitalSettingService.ts` - API calls for hospital settings
  - `get()` - Fetch current settings
  - `update()` - Update settings with new data

### Components Updated

#### 1. AppSidebar
- Displays hospital logo (if uploaded) or default icon
- Shows hospital name dynamically
- Falls back to "MedScheduler" if no name is set

#### 2. SettingsPage - Hospital Tab
- Logo upload with preview
  - Supports PNG, JPG, SVG formats
  - Max file size: 2MB
  - Shows current logo or default icon
  - Click camera icon or "Choose File" button to upload
- Hospital information form:
  - Hospital Name (required)
  - Address (optional)
  - Contact Number (optional)
  - Max Weekly Hours (default: 48)
- "Update Hospital Info" button saves all changes

#### 3. App.tsx
- Wrapped with `HospitalSettingsProvider` to provide global access to settings

## Features

### Logo Management
1. **Upload**: Click the camera icon or "Choose File" button
2. **Preview**: See the logo immediately after selection
3. **Validation**: Automatic file size check (max 2MB)
4. **Storage**: Stored as base64 in database for easy retrieval
5. **Display**: Shows in sidebar and can be used in other components

### Hospital Name
1. **Editable**: Change from Settings → Hospital tab
2. **Dynamic**: Updates immediately in sidebar after save
3. **Persistent**: Stored in database and loaded on app start
4. **Fallback**: Shows "MedScheduler" if not set

### Real-time Updates
- After saving hospital settings, the sidebar updates automatically
- Uses context to propagate changes throughout the app
- No page refresh required

## Usage

### For Administrators

1. **Change Hospital Name**:
   - Go to Settings → Hospital tab
   - Update "Hospital Name" field
   - Click "Update Hospital Info"
   - Name appears in sidebar immediately

2. **Upload Hospital Logo**:
   - Go to Settings → Hospital tab
   - Click camera icon or "Choose File" button
   - Select image file (PNG, JPG, or SVG, max 2MB)
   - Preview appears immediately
   - Click "Update Hospital Info" to save
   - Logo appears in sidebar immediately

3. **Update Other Information**:
   - Address, phone, and max weekly hours can also be updated
   - All changes save together when clicking "Update Hospital Info"

## Technical Details

### Logo Storage
- Logos are stored as base64 encoded strings in the database
- This approach:
  - Eliminates need for file storage management
  - Simplifies deployment (no file uploads to manage)
  - Works seamlessly with API responses
  - Easy to display in `<img>` tags

### File Size Limit
- 2MB maximum to prevent database bloat
- Validation happens on frontend before upload
- Error toast shown if file is too large

### Supported Formats
- PNG - Best for logos with transparency
- JPG/JPEG - Good for photographic logos
- SVG - Vector format, scales perfectly

## Benefits

1. **Branding**: Each hospital can customize the application with their own identity
2. **Professional**: Shows hospital logo and name throughout the interface
3. **Easy Management**: Simple upload process, no technical knowledge required
4. **Instant Updates**: Changes reflect immediately without page refresh
5. **Persistent**: Settings saved in database and loaded on every app start

## Default Settings

If no settings exist, the system creates defaults:
- Hospital Name: "MedScheduler"
- Max Weekly Hours: 48
- Logo: None (shows default icon)

## Future Enhancements

Potential additions:
- Multiple logo sizes (favicon, mobile, desktop)
- Theme color customization
- Email templates with hospital branding
- PDF report headers with logo
- Custom domain/subdomain per hospital
