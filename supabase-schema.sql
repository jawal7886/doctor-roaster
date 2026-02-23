-- ============================================
-- Hospital Harmony - Supabase Database Schema
-- ============================================
-- This schema supports a complete hospital staff management system
-- with departments, users, shifts, schedules, leaves, and notifications.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. DEPARTMENTS TABLE
-- ============================================
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    head_id UUID, -- Foreign key to users table (set later)
    max_hours_per_doctor INTEGER NOT NULL DEFAULT 40,
    doctor_count INTEGER NOT NULL DEFAULT 0,
    color VARCHAR(7) NOT NULL DEFAULT '#3b82f6', -- Hex color code
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. USERS TABLE (Staff Members)
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'doctor', 'nurse', 'staff', 'department_head')),
    specialty VARCHAR(100),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'on_leave')),
    avatar TEXT, -- URL to avatar image
    join_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add foreign key constraint for department head
ALTER TABLE departments 
ADD CONSTRAINT fk_department_head 
FOREIGN KEY (head_id) REFERENCES users(id) ON DELETE SET NULL;

-- ============================================
-- 3. SHIFTS TABLE
-- ============================================
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('morning', 'evening', 'night')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    required_staff INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(department_id, type) -- One shift type per department
);

-- ============================================
-- 4. SCHEDULE ENTRIES TABLE
-- ============================================
CREATE TABLE schedule_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    department_id UUID NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    shift_type VARCHAR(20) NOT NULL CHECK (shift_type IN ('morning', 'evening', 'night')),
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'swapped', 'cancelled')),
    is_on_call BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date, shift_type) -- Prevent double-booking
);

-- ============================================
-- 5. LEAVE REQUESTS TABLE
-- ============================================
CREATE TABLE leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CHECK (end_date >= start_date)
);

-- ============================================
-- 6. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('shift', 'swap', 'leave', 'emergency', 'general')),
    is_read BOOLEAN NOT NULL DEFAULT false,
    related_id UUID, -- ID of related entity (schedule, leave, etc.)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. HOSPITAL SETTINGS TABLE
-- ============================================
CREATE TABLE hospital_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    hospital_name VARCHAR(200) NOT NULL,
    address TEXT,
    contact_number VARCHAR(20),
    max_weekly_hours INTEGER NOT NULL DEFAULT 48,
    email_notifications_enabled BOOLEAN NOT NULL DEFAULT true,
    sms_notifications_enabled BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. AUDIT LOG TABLE (Optional - for tracking changes)
-- ============================================
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL, -- e.g., 'CREATE', 'UPDATE', 'DELETE'
    table_name VARCHAR(50) NOT NULL,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES for Performance
-- ============================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);

-- Schedule entries indexes
CREATE INDEX idx_schedule_user ON schedule_entries(user_id);
CREATE INDEX idx_schedule_date ON schedule_entries(date);
CREATE INDEX idx_schedule_department ON schedule_entries(department_id);
CREATE INDEX idx_schedule_status ON schedule_entries(status);
CREATE INDEX idx_schedule_date_range ON schedule_entries(date, department_id);

-- Leave requests indexes
CREATE INDEX idx_leave_user ON leave_requests(user_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_leave_dates ON leave_requests(start_date, end_date);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Shifts indexes
CREATE INDEX idx_shifts_department ON shifts(department_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_entries_updated_at BEFORE UPDATE ON schedule_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON leave_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hospital_settings_updated_at BEFORE UPDATE ON hospital_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update department doctor count
CREATE OR REPLACE FUNCTION update_department_doctor_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
        UPDATE departments 
        SET doctor_count = (
            SELECT COUNT(*) 
            FROM users 
            WHERE department_id = NEW.department_id 
            AND role IN ('doctor', 'department_head')
            AND status = 'active'
        )
        WHERE id = NEW.department_id;
    END IF;
    
    IF TG_OP = 'DELETE' OR TG_OP = 'UPDATE' THEN
        UPDATE departments 
        SET doctor_count = (
            SELECT COUNT(*) 
            FROM users 
            WHERE department_id = OLD.department_id 
            AND role IN ('doctor', 'department_head')
            AND status = 'active'
        )
        WHERE id = OLD.department_id;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update doctor count
CREATE TRIGGER update_doctor_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION update_department_doctor_count();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Example RLS Policies (customize based on your auth setup)

-- Departments: Everyone can read, only admins can modify
CREATE POLICY "Departments are viewable by everyone" ON departments
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify departments" ON departments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Users: Everyone can read, users can update their own profile, admins can do all
CREATE POLICY "Users are viewable by everyone" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can manage all users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Schedule Entries: Users can view their own and their department's schedules
CREATE POLICY "Users can view their own schedules" ON schedule_entries
    FOR SELECT USING (
        user_id = auth.uid() OR
        department_id IN (
            SELECT department_id FROM users WHERE id = auth.uid()
        )
    );

CREATE POLICY "Admins and dept heads can manage schedules" ON schedule_entries
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'department_head')
        )
    );

-- Leave Requests: Users can manage their own, admins/dept heads can manage all
CREATE POLICY "Users can view and create their own leave requests" ON leave_requests
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own leave requests" ON leave_requests
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins and dept heads can manage leave requests" ON leave_requests
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'department_head')
        )
    );

-- Notifications: Users can only see their own notifications
CREATE POLICY "Users can view their own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- VIEWS for Common Queries
-- ============================================

-- View: User details with department info
CREATE OR REPLACE VIEW user_details AS
SELECT 
    u.id,
    u.name,
    u.email,
    u.phone,
    u.role,
    u.specialty,
    u.status,
    u.avatar,
    u.join_date,
    d.id as department_id,
    d.name as department_name,
    d.color as department_color
FROM users u
LEFT JOIN departments d ON u.department_id = d.id;

-- View: Today's schedule with user and department details
CREATE OR REPLACE VIEW todays_schedule AS
SELECT 
    se.id,
    se.date,
    se.shift_type,
    se.status,
    se.is_on_call,
    u.name as user_name,
    u.role as user_role,
    u.specialty,
    d.name as department_name,
    d.color as department_color,
    s.start_time,
    s.end_time
FROM schedule_entries se
JOIN users u ON se.user_id = u.id
JOIN departments d ON se.department_id = d.id
JOIN shifts s ON se.shift_id = s.id
WHERE se.date = CURRENT_DATE;

-- View: Pending leave requests with user details
CREATE OR REPLACE VIEW pending_leaves AS
SELECT 
    lr.id,
    lr.start_date,
    lr.end_date,
    lr.reason,
    lr.created_at,
    u.name as user_name,
    u.email as user_email,
    u.role as user_role,
    d.name as department_name
FROM leave_requests lr
JOIN users u ON lr.user_id = u.id
LEFT JOIN departments d ON u.department_id = d.id
WHERE lr.status = 'pending'
ORDER BY lr.created_at ASC;

-- View: Department statistics
CREATE OR REPLACE VIEW department_stats AS
SELECT 
    d.id,
    d.name,
    d.color,
    d.doctor_count,
    d.max_hours_per_doctor,
    COUNT(DISTINCT se.id) as total_shifts_this_week,
    COUNT(DISTINCT CASE WHEN se.is_on_call THEN se.id END) as on_call_shifts
FROM departments d
LEFT JOIN schedule_entries se ON d.id = se.department_id 
    AND se.date >= DATE_TRUNC('week', CURRENT_DATE)
    AND se.date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days'
GROUP BY d.id, d.name, d.color, d.doctor_count, d.max_hours_per_doctor;

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Insert sample hospital settings
INSERT INTO hospital_settings (hospital_name, address, contact_number, max_weekly_hours)
VALUES ('City General Hospital', '123 Medical Center Blvd', '+1-555-0000', 48);

-- Insert sample departments
INSERT INTO departments (id, name, description, max_hours_per_doctor, color) VALUES
('11111111-1111-1111-1111-111111111111', 'Emergency', 'Emergency and trauma care', 40, '#ef4444'),
('22222222-2222-2222-2222-222222222222', 'Cardiology', 'Heart and cardiovascular system', 44, '#3b82f6'),
('33333333-3333-3333-3333-333333333333', 'Pediatrics', 'Children and adolescent care', 40, '#22c55e'),
('44444444-4444-4444-4444-444444444444', 'Neurology', 'Brain and nervous system', 42, '#a855f7'),
('55555555-5555-5555-5555-555555555555', 'Surgery', 'General and specialized surgery', 48, '#f59e0b'),
('66666666-6666-6666-6666-666666666666', 'Orthopedics', 'Musculoskeletal system', 40, '#06b6d4');

-- Insert sample shifts for each department
INSERT INTO shifts (department_id, type, start_time, end_time, required_staff) VALUES
-- Emergency shifts
('11111111-1111-1111-1111-111111111111', 'morning', '07:00', '15:00', 4),
('11111111-1111-1111-1111-111111111111', 'evening', '15:00', '23:00', 3),
('11111111-1111-1111-1111-111111111111', 'night', '23:00', '07:00', 2),
-- Cardiology shifts
('22222222-2222-2222-2222-222222222222', 'morning', '08:00', '16:00', 2),
('22222222-2222-2222-2222-222222222222', 'evening', '16:00', '00:00', 2),
('22222222-2222-2222-2222-222222222222', 'night', '00:00', '08:00', 1),
-- Pediatrics shifts
('33333333-3333-3333-3333-333333333333', 'morning', '08:00', '16:00', 2),
('33333333-3333-3333-3333-333333333333', 'evening', '16:00', '00:00', 2),
('33333333-3333-3333-3333-333333333333', 'night', '00:00', '08:00', 1);

-- Note: Add users after setting up Supabase Auth
-- Users should be created through Supabase Auth, then linked to this users table

-- ============================================
-- USEFUL QUERIES
-- ============================================

-- Get all active doctors in a department
-- SELECT * FROM users WHERE department_id = 'dept-id' AND role IN ('doctor', 'department_head') AND status = 'active';

-- Get schedule for a specific date range
-- SELECT * FROM schedule_entries WHERE date BETWEEN '2026-02-13' AND '2026-02-20';

-- Get unread notifications for a user
-- SELECT * FROM notifications WHERE user_id = 'user-id' AND is_read = false ORDER BY created_at DESC;

-- Get leave requests that overlap with a date range
-- SELECT * FROM leave_requests WHERE start_date <= '2026-02-20' AND end_date >= '2026-02-13';

-- Calculate total hours worked by a user in a week
-- SELECT u.name, COUNT(se.id) * 8 as total_hours
-- FROM users u
-- JOIN schedule_entries se ON u.id = se.user_id
-- WHERE se.date >= DATE_TRUNC('week', CURRENT_DATE)
-- GROUP BY u.id, u.name;
