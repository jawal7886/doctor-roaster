# Hospital Harmony - Database Structure

## Database: `dr_roaster`

### Tables Overview

| Table | Records | Description |
|-------|---------|-------------|
| users | 9 | Staff members with authentication |
| departments | 6 | Hospital departments |
| shifts | 18 | Shift definitions (3 per department) |
| schedule_entries | 0 | Shift assignments (empty, ready for data) |
| leave_requests | 0 | Leave requests (empty, ready for data) |
| notifications | 0 | User notifications (empty, ready for data) |
| hospital_settings | 1 | Global hospital configuration |
| audit_logs | 0 | Change tracking (empty, ready for data) |

---

## Table Schemas

### 1. users

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| name | VARCHAR(100) | Full name |
| email | VARCHAR(255) | Email (unique) |
| email_verified_at | TIMESTAMP | Email verification |
| password | VARCHAR(255) | Hashed password |
| phone | VARCHAR(20) | Phone number |
| role | ENUM | admin, doctor, nurse, staff, department_head |
| specialty | VARCHAR(100) | Medical specialty |
| department_id | BIGINT | Foreign key to departments |
| status | ENUM | active, inactive, on_leave |
| avatar | TEXT | Avatar URL |
| join_date | DATE | Date joined hospital |
| remember_token | VARCHAR(100) | Remember me token |
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Updated timestamp |

**Indexes**: email, department_id, role, status

**Sample Data**:
```
ID | Name              | Email                      | Role            | Department
1  | Admin User        | admin@hospital.com         | admin           | NULL
2  | Dr. Sarah Chen    | sarah.chen@hospital.com    | doctor          | Emergency
3  | Dr. James Wilson  | james.wilson@hospital.com  | doctor          | Cardiology
4  | Dr. Maria Garcia  | maria.garcia@hospital.com  | department_head | Pediatrics
```

---

### 2. departments

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| name | VARCHAR(100) | Department name (unique) |
| description | TEXT | Department description |
| head_id | BIGINT | Foreign key to users (department head) |
| max_hours_per_doctor | INT | Maximum hours per doctor |
| doctor_count | INT | Number of doctors (auto-calculated) |
| color | VARCHAR(7) | Hex color code |
| is_active | BOOLEAN | Active status |
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Updated timestamp |

**Indexes**: is_active

**Sample Data**:
```
ID | Name        | Color   | Max Hours | Doctors
1  | Emergency   | #ef4444 | 40        | 2
2  | Cardiology  | #3b82f6 | 44        | 2
3  | Pediatrics  | #22c55e | 40        | 1
4  | Neurology   | #a855f7 | 42        | 1
5  | Surgery     | #f59e0b | 48        | 1
6  | Orthopedics | #06b6d4 | 40        | 1
```

---

### 3. shifts

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| department_id | BIGINT | Foreign key to departments |
| type | ENUM | morning, evening, night |
| start_time | TIME | Shift start time |
| end_time | TIME | Shift end time |
| required_staff | INT | Required staff count |
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Updated timestamp |

**Unique**: (department_id, type)
**Indexes**: department_id

**Sample Data**:
```
ID | Department  | Type    | Start | End   | Required Staff
1  | Emergency   | morning | 07:00 | 15:00 | 3
2  | Emergency   | evening | 15:00 | 23:00 | 2
3  | Emergency   | night   | 23:00 | 07:00 | 2
```

---

### 4. schedule_entries

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key to users |
| shift_id | BIGINT | Foreign key to shifts |
| date | DATE | Schedule date |
| department_id | BIGINT | Foreign key to departments |
| shift_type | ENUM | morning, evening, night |
| status | ENUM | scheduled, confirmed, swapped, cancelled |
| is_on_call | BOOLEAN | On-call status |
| notes | TEXT | Additional notes |
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Updated timestamp |

**Unique**: (user_id, date, shift_type) - Prevents double-booking
**Indexes**: user_id, date, department_id, status, (date, department_id)

---

### 5. leave_requests

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key to users |
| start_date | DATE | Leave start date |
| end_date | DATE | Leave end date |
| reason | TEXT | Leave reason |
| status | ENUM | pending, approved, rejected |
| approved_by | BIGINT | Foreign key to users (approver) |
| approved_at | TIMESTAMP | Approval timestamp |
| rejection_reason | TEXT | Rejection reason |
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Updated timestamp |

**Indexes**: user_id, status, (start_date, end_date)

---

### 6. notifications

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key to users |
| title | VARCHAR(200) | Notification title |
| message | TEXT | Notification message |
| type | ENUM | shift, swap, leave, emergency, general |
| is_read | BOOLEAN | Read status |
| related_id | BIGINT | Related entity ID |
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Updated timestamp |

**Indexes**: user_id, (user_id, is_read), created_at

---

### 7. hospital_settings

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| hospital_name | VARCHAR(200) | Hospital name |
| address | TEXT | Hospital address |
| contact_number | VARCHAR(20) | Contact phone |
| max_weekly_hours | INT | Maximum weekly hours |
| email_notifications_enabled | BOOLEAN | Email notifications |
| sms_notifications_enabled | BOOLEAN | SMS notifications |
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Updated timestamp |

**Sample Data**:
```
Hospital Name: City General Hospital
Address: 123 Medical Center Blvd, Healthcare City, HC 12345
Contact: +1-555-0000
Max Weekly Hours: 48
```

---

### 8. audit_logs

| Column | Type | Description |
|--------|------|-------------|
| id | BIGINT | Primary key |
| user_id | BIGINT | Foreign key to users |
| action | VARCHAR(50) | Action performed (CREATE, UPDATE, DELETE) |
| table_name | VARCHAR(50) | Table affected |
| record_id | BIGINT | Record ID affected |
| old_values | JSON | Old values |
| new_values | JSON | New values |
| ip_address | VARCHAR(45) | User IP address |
| created_at | TIMESTAMP | Created timestamp |
| updated_at | TIMESTAMP | Updated timestamp |

**Indexes**: user_id, table_name, created_at

---

## Relationships

### One-to-Many

1. **departments → users**
   - One department has many users
   - `departments.id` → `users.department_id`

2. **users → departments (head)**
   - One user can be head of one department
   - `users.id` → `departments.head_id`

3. **departments → shifts**
   - One department has many shifts
   - `departments.id` → `shifts.department_id`

4. **users → schedule_entries**
   - One user has many schedule entries
   - `users.id` → `schedule_entries.user_id`

5. **shifts → schedule_entries**
   - One shift has many schedule entries
   - `shifts.id` → `schedule_entries.shift_id`

6. **departments → schedule_entries**
   - One department has many schedule entries
   - `departments.id` → `schedule_entries.department_id`

7. **users → leave_requests**
   - One user has many leave requests
   - `users.id` → `leave_requests.user_id`

8. **users → notifications**
   - One user has many notifications
   - `users.id` → `notifications.user_id`

9. **users → audit_logs**
   - One user has many audit logs
   - `users.id` → `audit_logs.user_id`

---

## Constraints

### Foreign Keys

- `users.department_id` → `departments.id` (SET NULL on delete)
- `departments.head_id` → `users.id` (SET NULL on delete)
- `shifts.department_id` → `departments.id` (CASCADE on delete)
- `schedule_entries.user_id` → `users.id` (CASCADE on delete)
- `schedule_entries.shift_id` → `shifts.id` (CASCADE on delete)
- `schedule_entries.department_id` → `departments.id` (CASCADE on delete)
- `leave_requests.user_id` → `users.id` (CASCADE on delete)
- `leave_requests.approved_by` → `users.id` (SET NULL on delete)
- `notifications.user_id` → `users.id` (CASCADE on delete)
- `audit_logs.user_id` → `users.id` (SET NULL on delete)

### Unique Constraints

- `users.email` - Unique email addresses
- `departments.name` - Unique department names
- `shifts(department_id, type)` - One shift type per department
- `schedule_entries(user_id, date, shift_type)` - Prevents double-booking

---

## Enums

### user.role
- `admin` - System administrator
- `doctor` - Medical doctor
- `nurse` - Nursing staff
- `staff` - General staff
- `department_head` - Department head

### user.status
- `active` - Currently working
- `inactive` - Not currently working
- `on_leave` - On leave

### shift.type / schedule_entry.shift_type
- `morning` - Morning shift (07:00-15:00)
- `evening` - Evening shift (15:00-23:00)
- `night` - Night shift (23:00-07:00)

### schedule_entry.status
- `scheduled` - Scheduled but not confirmed
- `confirmed` - Confirmed by user
- `swapped` - Swapped with another user
- `cancelled` - Cancelled

### leave_request.status
- `pending` - Awaiting approval
- `approved` - Approved by manager
- `rejected` - Rejected by manager

### notification.type
- `shift` - Shift-related notification
- `swap` - Shift swap notification
- `leave` - Leave request notification
- `emergency` - Emergency notification
- `general` - General notification

---

## Query Examples

### Get all active doctors in Emergency department
```sql
SELECT * FROM users 
WHERE department_id = 1 
AND role IN ('doctor', 'department_head') 
AND status = 'active';
```

### Get today's schedule with user details
```sql
SELECT se.*, u.name, u.role, d.name as department_name, s.start_time, s.end_time
FROM schedule_entries se
JOIN users u ON se.user_id = u.id
JOIN departments d ON se.department_id = d.id
JOIN shifts s ON se.shift_id = s.id
WHERE se.date = CURDATE();
```

### Get pending leave requests
```sql
SELECT lr.*, u.name, u.email, d.name as department_name
FROM leave_requests lr
JOIN users u ON lr.user_id = u.id
LEFT JOIN departments d ON u.department_id = d.id
WHERE lr.status = 'pending'
ORDER BY lr.created_at ASC;
```

### Get unread notifications for a user
```sql
SELECT * FROM notifications 
WHERE user_id = 1 
AND is_read = false 
ORDER BY created_at DESC;
```

### Calculate total hours worked by user this week
```sql
SELECT u.name, COUNT(se.id) * 8 as total_hours
FROM users u
JOIN schedule_entries se ON u.id = se.user_id
WHERE se.date >= DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY)
GROUP BY u.id, u.name;
```

---

## Backup Command

```bash
mysqldump -u root -p dr_roaster > backup_$(date +%Y%m%d).sql
```

## Restore Command

```bash
mysql -u root -p dr_roaster < backup_20260217.sql
```
