# Hospital Harmony - Quick Reference Card

## 🚀 Start Commands

```bash
# Frontend (React)
npm run dev                    # http://localhost:8080

# Backend (Laravel)
cd backend
php artisan serve             # http://localhost:8000
```

## 🔑 Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hospital.com | password |
| Doctor | sarah.chen@hospital.com | password |
| Nurse | rachel.kim@hospital.com | password |

## 📊 Database Info

- **Name**: `dr_roaster`
- **Host**: `127.0.0.1:3306`
- **User**: `root`
- **Pass**: (empty)

## 🛠️ Common Commands

### Laravel

```bash
# Migrations
php artisan migrate                    # Run migrations
php artisan migrate:fresh --seed       # Reset & seed
php artisan migrate:rollback           # Rollback last

# Database
php artisan db:seed                    # Run seeders
php artisan tinker                     # Interactive shell

# Generate
php artisan make:model ModelName       # Create model
php artisan make:controller Name       # Create controller
php artisan make:migration name        # Create migration

# Cache
php artisan cache:clear                # Clear cache
php artisan config:clear               # Clear config
php artisan route:clear                # Clear routes
```

### Frontend

```bash
npm run dev                            # Start dev server
npm run build                          # Build for production
npm run preview                        # Preview build
npm run lint                           # Run linter
```

## 📁 Key Files

### Backend
- `backend/.env` - Environment config
- `backend/routes/api.php` - API routes
- `backend/app/Models/` - Eloquent models
- `backend/app/Http/Controllers/Api/` - API controllers
- `backend/database/migrations/` - Database migrations

### Frontend
- `src/services/` - API service layer
- `src/types/index.ts` - TypeScript types
- `src/pages/` - Page components
- `src/components/` - Reusable components

## 🗄️ Database Tables

| Table | Records | Purpose |
|-------|---------|---------|
| users | 9 | Staff members |
| departments | 6 | Hospital departments |
| shifts | 18 | Shift definitions |
| schedule_entries | 0 | Shift assignments |
| leave_requests | 0 | Leave requests |
| notifications | 0 | User notifications |
| hospital_settings | 1 | Global settings |

## 🔗 Relationships

```
departments ←→ users (department_id)
users ←→ departments (head_id)
departments ←→ shifts
users ←→ schedule_entries
shifts ←→ schedule_entries
users ←→ leave_requests
users ←→ notifications
```

## 📝 Enums

### User Roles
- `admin` - System administrator
- `doctor` - Medical doctor
- `nurse` - Nursing staff
- `staff` - General staff
- `department_head` - Department head

### User Status
- `active` - Currently working
- `inactive` - Not working
- `on_leave` - On leave

### Shift Types
- `morning` - 07:00-15:00
- `evening` - 15:00-23:00
- `night` - 23:00-07:00

### Schedule Status
- `scheduled` - Scheduled
- `confirmed` - Confirmed
- `swapped` - Swapped
- `cancelled` - Cancelled

### Leave Status
- `pending` - Awaiting approval
- `approved` - Approved
- `rejected` - Rejected

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Check MySQL is running
# Verify .env credentials
# Ensure database exists
```

### Class Not Found
```bash
cd backend
composer dump-autoload
```

### Migration Errors
```bash
cd backend
php artisan migrate:fresh --seed
```

### Frontend Build Errors
```bash
npm install
npm run dev
```

## 📚 Documentation Files

1. `SETUP_COMPLETE.md` - Complete setup summary
2. `LARAVEL_BACKEND_SETUP.md` - Laravel guide
3. `DATABASE_STRUCTURE.md` - Database reference
4. `SUPABASE_SETUP_GUIDE.md` - Supabase alternative
5. `SIDEBAR_FIX_NOTES.md` - Frontend fixes

## 🎯 Next Steps

1. ✅ Setup complete
2. ⏭️ Create Laravel models
3. ⏭️ Create API controllers
4. ⏭️ Install Sanctum (auth)
5. ⏭️ Configure CORS
6. ⏭️ Update frontend services
7. ⏭️ Test API endpoints
8. ⏭️ Implement features

## 💡 Tips

- Always run migrations after pulling changes
- Use `php artisan tinker` to test queries
- Check Laravel logs: `backend/storage/logs/`
- Use browser DevTools for frontend debugging
- Keep both servers running during development

---

**Quick Help**: Check `SETUP_COMPLETE.md` for detailed information!
