# Hospital Harmony - Laravel Backend Setup Guide

## ✅ Completed Setup

Your Laravel backend has been successfully set up with the following:

### Database Configuration
- **Database Name**: `dr_roaster`
- **Connection**: MySQL
- **Host**: 127.0.0.1
- **Port**: 3306
- **Username**: root
- **Password**: (empty)

### Created Tables

1. **users** - Staff members with authentication
2. **departments** - Hospital departments
3. **shifts** - Shift definitions per department
4. **schedule_entries** - Shift assignments
5. **leave_requests** - Leave/vacation requests
6. **notifications** - In-app notifications
7. **hospital_settings** - Global hospital configuration
8. **audit_logs** - Change tracking
9. **password_reset_tokens** - Password reset functionality
10. **sessions** - User sessions
11. **cache** - Application cache
12. **jobs** - Queue jobs

### Sample Data Seeded

✅ **6 Departments**:
- Emergency (Red)
- Cardiology (Blue)
- Pediatrics (Green)
- Neurology (Purple)
- Surgery (Orange)
- Orthopedics (Cyan)

✅ **9 Users**:
- 1 Admin
- 6 Doctors
- 2 Nurses

✅ **18 Shifts** (3 per department):
- Morning: 07:00 - 15:00
- Evening: 15:00 - 23:00
- Night: 23:00 - 07:00

✅ **Hospital Settings**:
- City General Hospital
- Max weekly hours: 48

### Default Login Credentials

**Admin Account:**
- Email: `admin@hospital.com`
- Password: `password`

**Doctor Account:**
- Email: `sarah.chen@hospital.com`
- Password: `password`

**All users have the same password**: `password`

## 🚀 Running the Backend

### Start the Laravel Development Server

```bash
cd backend
php artisan serve
```

The API will be available at: `http://localhost:8000`

### Alternative Port

If port 8000 is busy:

```bash
php artisan serve --port=8001
```

## 📡 API Endpoints (To Be Created)

You'll need to create controllers and routes for:

### Authentication
- POST `/api/login` - User login
- POST `/api/logout` - User logout
- POST `/api/register` - User registration
- GET `/api/user` - Get authenticated user

### Departments
- GET `/api/departments` - List all departments
- POST `/api/departments` - Create department
- GET `/api/departments/{id}` - Get department
- PUT `/api/departments/{id}` - Update department
- DELETE `/api/departments/{id}` - Delete department

### Users
- GET `/api/users` - List all users
- POST `/api/users` - Create user
- GET `/api/users/{id}` - Get user
- PUT `/api/users/{id}` - Update user
- DELETE `/api/users/{id}` - Delete user

### Shifts
- GET `/api/shifts` - List all shifts
- POST `/api/shifts` - Create shift
- GET `/api/shifts/{id}` - Get shift
- PUT `/api/shifts/{id}` - Update shift
- DELETE `/api/shifts/{id}` - Delete shift

### Schedule Entries
- GET `/api/schedule-entries` - List schedule entries
- POST `/api/schedule-entries` - Create schedule entry
- GET `/api/schedule-entries/{id}` - Get schedule entry
- PUT `/api/schedule-entries/{id}` - Update schedule entry
- DELETE `/api/schedule-entries/{id}` - Delete schedule entry

### Leave Requests
- GET `/api/leave-requests` - List leave requests
- POST `/api/leave-requests` - Create leave request
- GET `/api/leave-requests/{id}` - Get leave request
- PUT `/api/leave-requests/{id}` - Update leave request
- PUT `/api/leave-requests/{id}/approve` - Approve leave
- PUT `/api/leave-requests/{id}/reject` - Reject leave

### Notifications
- GET `/api/notifications` - List notifications
- PUT `/api/notifications/{id}/read` - Mark as read
- DELETE `/api/notifications/{id}` - Delete notification

### Hospital Settings
- GET `/api/settings` - Get hospital settings
- PUT `/api/settings` - Update hospital settings

## 🔧 Next Steps

### 1. Install Laravel Sanctum for API Authentication

```bash
cd backend
composer require laravel/sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

### 2. Create Models

```bash
php artisan make:model Department
php artisan make:model Shift
php artisan make:model ScheduleEntry
php artisan make:model LeaveRequest
php artisan make:model Notification
php artisan make:model HospitalSetting
php artisan make:model AuditLog
```

### 3. Create Controllers

```bash
php artisan make:controller Api/AuthController
php artisan make:controller Api/DepartmentController --api
php artisan make:controller Api/UserController --api
php artisan make:controller Api/ShiftController --api
php artisan make:controller Api/ScheduleEntryController --api
php artisan make:controller Api/LeaveRequestController --api
php artisan make:controller Api/NotificationController --api
php artisan make:controller Api/HospitalSettingController --api
```

### 4. Enable CORS

Update `config/cors.php`:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie'],
'allowed_origins' => ['http://localhost:8080', 'http://localhost:5173'],
'allowed_methods' => ['*'],
'allowed_headers' => ['*'],
'supports_credentials' => true,
```

### 5. Update Frontend to Use Laravel API

Update your React app's `.env.local`:

```env
VITE_API_URL=http://localhost:8000/api
```

## 📝 Useful Artisan Commands

### Database Commands

```bash
# Run migrations
php artisan migrate

# Rollback last migration
php artisan migrate:rollback

# Reset database and run all migrations
php artisan migrate:fresh

# Run migrations and seeders
php artisan migrate:fresh --seed

# Run specific seeder
php artisan db:seed --class=DepartmentSeeder
```

### Cache Commands

```bash
# Clear application cache
php artisan cache:clear

# Clear config cache
php artisan config:clear

# Clear route cache
php artisan route:clear

# Clear view cache
php artisan view:clear
```

### Development Commands

```bash
# Start development server
php artisan serve

# Run queue worker
php artisan queue:work

# Create new controller
php artisan make:controller ControllerName

# Create new model
php artisan make:model ModelName

# Create new migration
php artisan make:migration create_table_name

# Create new seeder
php artisan make:seeder SeederName
```

## 🔐 Security Notes

1. **Change Default Passwords**: Update all seeded user passwords in production
2. **Environment Variables**: Never commit `.env` file to version control
3. **API Rate Limiting**: Configure rate limiting in `app/Http/Kernel.php`
4. **HTTPS**: Use HTTPS in production
5. **Database Credentials**: Use strong passwords for production database

## 🧪 Testing

### Run Tests

```bash
php artisan test
```

### Create Tests

```bash
# Feature test
php artisan make:test DepartmentTest

# Unit test
php artisan make:test DepartmentTest --unit
```

## 📦 Additional Packages to Consider

### API Resources
```bash
composer require spatie/laravel-query-builder
```

### API Documentation
```bash
composer require darkaonline/l5-swagger
```

### Activity Logging
```bash
composer require spatie/laravel-activitylog
```

### Image Handling
```bash
composer require intervention/image
```

### Excel Export
```bash
composer require maatwebsite/excel
```

## 🐛 Troubleshooting

### "Access denied for user" Error
- Check MySQL is running (XAMPP/WAMP)
- Verify database credentials in `.env`
- Ensure database `dr_roaster` exists

### "Class not found" Error
```bash
composer dump-autoload
```

### Migration Errors
```bash
php artisan migrate:fresh
```

### Permission Errors (Linux/Mac)
```bash
chmod -R 775 storage bootstrap/cache
```

## 📚 Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Laravel API Resources](https://laravel.com/docs/eloquent-resources)
- [Laravel Sanctum](https://laravel.com/docs/sanctum)
- [Laravel Best Practices](https://github.com/alexeymezenin/laravel-best-practices)

## 🎯 Project Structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Api/          # API Controllers (to be created)
│   │   └── Middleware/
│   ├── Models/               # Eloquent Models (to be created)
│   └── Services/             # Business Logic (optional)
├── config/
│   ├── cors.php             # CORS configuration
│   └── database.php         # Database configuration
├── database/
│   ├── migrations/          # ✅ All migrations created
│   └── seeders/             # ✅ All seeders created
├── routes/
│   ├── api.php              # API routes (to be defined)
│   └── web.php              # Web routes
├── .env                     # ✅ Configured
└── composer.json
```

## ✨ Summary

Your Laravel backend is fully set up with:
- ✅ Database configured and connected
- ✅ All tables migrated
- ✅ Sample data seeded
- ✅ Ready for API development

Next: Create controllers and API routes to connect with your React frontend!
