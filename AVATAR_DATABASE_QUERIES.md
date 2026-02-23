# Avatar Database - SQL Query Reference

## Table Structure

### View Table Schema
```sql
SHOW CREATE TABLE user_avatars;
```

### View Table Columns
```sql
DESCRIBE user_avatars;
```

## Basic Queries

### View All Avatars
```sql
SELECT * FROM user_avatars;
```

### View Avatar Metadata (without base64 data)
```sql
SELECT 
    id,
    user_id,
    filename,
    original_name,
    mime_type,
    file_size,
    storage_type,
    created_at,
    updated_at
FROM user_avatars;
```

### Get Avatar for Specific User
```sql
SELECT * FROM user_avatars WHERE user_id = 1;
```

### Count Total Avatars
```sql
SELECT COUNT(*) as total_avatars FROM user_avatars;
```

## User + Avatar Queries

### Get Users with Their Avatars
```sql
SELECT 
    u.id,
    u.name,
    u.email,
    ua.filename,
    ua.file_size,
    ua.storage_type,
    ua.created_at as avatar_uploaded_at
FROM users u
LEFT JOIN user_avatars ua ON u.id = ua.user_id;
```

### Get Users WITHOUT Avatars
```sql
SELECT 
    u.id,
    u.name,
    u.email
FROM users u
LEFT JOIN user_avatars ua ON u.id = ua.user_id
WHERE ua.id IS NULL;
```

### Get Users WITH Avatars
```sql
SELECT 
    u.id,
    u.name,
    u.email,
    ua.filename
FROM users u
INNER JOIN user_avatars ua ON u.id = ua.user_id;
```

## Statistics Queries

### Total Storage Used (in bytes)
```sql
SELECT 
    SUM(file_size) as total_bytes,
    ROUND(SUM(file_size) / 1024, 2) as total_kb,
    ROUND(SUM(file_size) / 1024 / 1024, 2) as total_mb
FROM user_avatars;
```

### Average Avatar Size
```sql
SELECT 
    AVG(file_size) as avg_bytes,
    ROUND(AVG(file_size) / 1024, 2) as avg_kb
FROM user_avatars;
```

### Largest Avatars
```sql
SELECT 
    user_id,
    filename,
    file_size,
    ROUND(file_size / 1024, 2) as size_kb
FROM user_avatars
ORDER BY file_size DESC
LIMIT 10;
```

### Smallest Avatars
```sql
SELECT 
    user_id,
    filename,
    file_size,
    ROUND(file_size / 1024, 2) as size_kb
FROM user_avatars
ORDER BY file_size ASC
LIMIT 10;
```

### Avatars by Storage Type
```sql
SELECT 
    storage_type,
    COUNT(*) as count,
    ROUND(SUM(file_size) / 1024 / 1024, 2) as total_mb
FROM user_avatars
GROUP BY storage_type;
```

### Avatars by MIME Type
```sql
SELECT 
    mime_type,
    COUNT(*) as count,
    ROUND(AVG(file_size) / 1024, 2) as avg_kb
FROM user_avatars
GROUP BY mime_type;
```

### Recently Uploaded Avatars
```sql
SELECT 
    ua.user_id,
    u.name,
    ua.filename,
    ua.file_size,
    ua.created_at
FROM user_avatars ua
JOIN users u ON ua.user_id = u.id
ORDER BY ua.created_at DESC
LIMIT 10;
```

### Recently Updated Avatars
```sql
SELECT 
    ua.user_id,
    u.name,
    ua.filename,
    ua.updated_at
FROM user_avatars ua
JOIN users u ON ua.user_id = u.id
ORDER BY ua.updated_at DESC
LIMIT 10;
```

## Maintenance Queries

### Find Orphaned Avatars (users deleted but avatars remain)
```sql
-- Should return 0 rows due to CASCADE delete
SELECT ua.*
FROM user_avatars ua
LEFT JOIN users u ON ua.user_id = u.id
WHERE u.id IS NULL;
```

### Find Users with Multiple Avatars (should be 0 due to UNIQUE constraint)
```sql
SELECT 
    user_id,
    COUNT(*) as avatar_count
FROM user_avatars
GROUP BY user_id
HAVING COUNT(*) > 1;
```

### Delete Avatar for Specific User
```sql
DELETE FROM user_avatars WHERE user_id = 1;
```

### Delete All Avatars (CAUTION!)
```sql
-- Use with extreme caution
DELETE FROM user_avatars;
```

### Update Storage Type
```sql
UPDATE user_avatars 
SET storage_type = 'local' 
WHERE user_id = 1;
```

## Backup Queries

### Export Avatar Metadata (without base64)
```sql
SELECT 
    user_id,
    filename,
    original_name,
    mime_type,
    file_size,
    storage_path,
    storage_type,
    created_at,
    updated_at
FROM user_avatars
INTO OUTFILE '/tmp/avatar_metadata.csv'
FIELDS TERMINATED BY ','
ENCLOSED BY '"'
LINES TERMINATED BY '\n';
```

### Count Avatars by Date
```sql
SELECT 
    DATE(created_at) as upload_date,
    COUNT(*) as avatars_uploaded
FROM user_avatars
GROUP BY DATE(created_at)
ORDER BY upload_date DESC;
```

## Performance Queries

### Check Index Usage
```sql
SHOW INDEX FROM user_avatars;
```

### Analyze Table
```sql
ANALYZE TABLE user_avatars;
```

### Optimize Table
```sql
OPTIMIZE TABLE user_avatars;
```

### Check Table Size
```sql
SELECT 
    table_name AS 'Table',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS 'Size (MB)'
FROM information_schema.TABLES
WHERE table_schema = DATABASE()
AND table_name = 'user_avatars';
```

## Migration Queries

### Copy Avatars from users.avatar to user_avatars
```sql
INSERT INTO user_avatars (user_id, filename, original_name, mime_type, file_size, storage_path, base64_data, storage_type)
SELECT 
    id as user_id,
    CONCAT('avatar_', id, '_migrated.png') as filename,
    'avatar.png' as original_name,
    'image/png' as mime_type,
    LENGTH(avatar) as file_size,
    CONCAT('avatars/avatar_', id, '_migrated.png') as storage_path,
    avatar as base64_data,
    'base64' as storage_type
FROM users
WHERE avatar IS NOT NULL
AND avatar != ''
AND NOT EXISTS (
    SELECT 1 FROM user_avatars WHERE user_avatars.user_id = users.id
);
```

### Verify Migration
```sql
SELECT 
    (SELECT COUNT(*) FROM users WHERE avatar IS NOT NULL AND avatar != '') as users_with_avatar,
    (SELECT COUNT(*) FROM user_avatars) as avatars_in_new_table;
```

## Monitoring Queries

### Daily Avatar Upload Stats
```sql
SELECT 
    DATE(created_at) as date,
    COUNT(*) as uploads,
    ROUND(SUM(file_size) / 1024 / 1024, 2) as total_mb
FROM user_avatars
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

### Storage Growth Over Time
```sql
SELECT 
    DATE_FORMAT(created_at, '%Y-%m') as month,
    COUNT(*) as new_avatars,
    ROUND(SUM(file_size) / 1024 / 1024, 2) as mb_added
FROM user_avatars
GROUP BY DATE_FORMAT(created_at, '%Y-%m')
ORDER BY month DESC;
```

## Cleanup Queries

### Find Large Avatars (> 1MB)
```sql
SELECT 
    user_id,
    filename,
    ROUND(file_size / 1024 / 1024, 2) as size_mb
FROM user_avatars
WHERE file_size > 1048576
ORDER BY file_size DESC;
```

### Find Old Avatars (> 1 year)
```sql
SELECT 
    user_id,
    filename,
    created_at
FROM user_avatars
WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

## Testing Queries

### Insert Test Avatar
```sql
INSERT INTO user_avatars (
    user_id, 
    filename, 
    original_name, 
    mime_type, 
    file_size, 
    storage_path, 
    base64_data, 
    storage_type
) VALUES (
    1,
    'avatar_1_test.png',
    'test.png',
    'image/png',
    1024,
    'avatars/avatar_1_test.png',
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
);
```

### Update Test Avatar
```sql
UPDATE user_avatars 
SET file_size = 2048,
    updated_at = NOW()
WHERE user_id = 1;
```

### Delete Test Avatar
```sql
DELETE FROM user_avatars WHERE user_id = 1;
```

## Useful Views

### Create View for User Avatars
```sql
CREATE VIEW v_user_avatars AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    ua.filename,
    ua.mime_type,
    ROUND(ua.file_size / 1024, 2) as size_kb,
    ua.storage_type,
    ua.created_at as uploaded_at
FROM users u
LEFT JOIN user_avatars ua ON u.id = ua.user_id;
```

### Query the View
```sql
SELECT * FROM v_user_avatars;
```

## Quick Reference

| Query Purpose | Command |
|---------------|---------|
| View all avatars | `SELECT * FROM user_avatars;` |
| Count avatars | `SELECT COUNT(*) FROM user_avatars;` |
| Total storage | `SELECT SUM(file_size) FROM user_avatars;` |
| Get user avatar | `SELECT * FROM user_avatars WHERE user_id = ?;` |
| Delete avatar | `DELETE FROM user_avatars WHERE user_id = ?;` |
| Check table size | See "Check Table Size" query above |

## Notes

- All file sizes are in bytes by default
- Use `/1024` for KB, `/1024/1024` for MB
- CASCADE delete ensures avatars are deleted when users are deleted
- UNIQUE constraint on `user_id` ensures one avatar per user
- `base64_data` is LONGTEXT (can store up to 4GB)
- Always backup before running DELETE or UPDATE queries
