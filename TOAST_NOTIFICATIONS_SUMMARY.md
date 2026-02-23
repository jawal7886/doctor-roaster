# Toast Notifications Summary

All actions in the application now show proper toast notifications with success/error messages.

## User Management (UsersPage)

### Add Staff (AddStaffModal)
- **Success**: "Success! - {name} has been added successfully."
- **Error**: "Error - Failed to add staff member. Please try again." (with specific error message from backend)

### Edit Staff (EditStaffModal)
- **Success**: "Success! - {name} has been updated successfully."
- **Error**: "Error - Failed to update staff member. Please try again." (with specific error message from backend)

### Delete Staff (UserDetailModal)
- **Success**: "Success - {name} has been removed successfully."
- **Error**: "Error - Failed to remove staff member." (with specific error message from backend)

## Department Management (DepartmentsPage)

### Add Department (AddDepartmentModal)
- **Success**: "Success! - {name} department has been created successfully."
- **Error**: "Error - Failed to create department. Please try again." (with specific error message from backend)

## Schedule Management (SchedulePage)

### Assign Shift (AssignShiftModal)
- **Success**: "Shift Assigned Successfully - {shift type} shift assigned to {name} on {date} (On-Call if applicable)."

## Leave Management (LeavesPage)

### Approve Leave
- **Success**: "Leave Approved - {name}'s leave request has been approved."

### Reject Leave
- **Error**: "Leave Rejected - {name}'s leave request has been rejected." (shown as destructive variant)

## Toast Notification Features

1. **Success Messages**: Green background with checkmark icon
2. **Error Messages**: Red background with X icon (destructive variant)
3. **Auto-dismiss**: Toasts automatically disappear after 5 seconds
4. **Manual dismiss**: Users can click the X button to dismiss
5. **Stacking**: Multiple toasts stack vertically
6. **Responsive**: Toasts adapt to mobile and desktop screens

## Event-Driven Updates

All CRUD operations trigger custom events to refresh data:
- `userAdded` - Refreshes user list
- `userUpdated` - Refreshes user list
- `userDeleted` - Refreshes user list
- `departmentAdded` - Refreshes department list

## Error Handling

All API calls include try-catch blocks with:
- Specific error messages from backend when available
- Generic fallback messages for network errors
- Loading states during operations
- Disabled buttons during loading to prevent double-submission
