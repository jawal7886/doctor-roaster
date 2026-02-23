/**
 * File: pages/UsersPage.tsx
 * Purpose: List and manage doctors, nurses, and staff.
 * Includes search, filter by role/department, user cards, and add/detail modals.
 */

import { useState, useEffect } from 'react';
import { Search, Plus, Filter, Mail, Phone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import AddStaffModal from '@/components/modals/AddStaffModal';
import EditStaffModal from '@/components/modals/EditStaffModal';
import UserDetailModal from '@/components/modals/UserDetailModal';
import { getUsers } from '@/services/userService';
import { getDepartments } from '@/services/departmentService';
import { ROLE_LABELS } from '@/constants';
import { UserRole, User, Department } from '@/types';

const UsersPage = () => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  /** Fetch users and departments */
  useEffect(() => {
    fetchData();
  }, [search, roleFilter]);

  /** Listen for user added/deleted/updated events */
  useEffect(() => {
    const handleUserAdded = () => {
      fetchData();
    };
    
    const handleUserDeleted = () => {
      fetchData();
    };

    const handleUserUpdated = () => {
      fetchData();
    };
    
    window.addEventListener('userAdded', handleUserAdded);
    window.addEventListener('userDeleted', handleUserDeleted);
    window.addEventListener('userUpdated', handleUserUpdated);
    
    return () => {
      window.removeEventListener('userAdded', handleUserAdded);
      window.removeEventListener('userDeleted', handleUserDeleted);
      window.removeEventListener('userUpdated', handleUserUpdated);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, deptData] = await Promise.all([
        getUsers({
          search: search || undefined,
          role: roleFilter !== 'all' ? (roleFilter as UserRole) : undefined,
        }),
        getDepartments(),
      ]);
      setUsers(usersData);
      setDepartments(deptData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  /** Handle clicking on a user card */
  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  /** Get department name by ID */
  const getDepartmentName = (id: number | null) => {
    if (!id) return 'No Department';
    const dept = departments.find((d) => d.id === id);
    return dept?.name || 'Unknown';
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Doctors & Staff"
        description="Manage hospital personnel, roles, and assignments"
        actions={
          <Button className="gap-2" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Staff Member
          </Button>
        }
      />

      {/* Filters row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search by name, email, or specialty..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-44">
            <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            {Object.entries(ROLE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Users grid */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-sm text-muted-foreground">Loading staff members...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="card-hover cursor-pointer rounded-xl border border-border bg-card p-5 shadow-card"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                  {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-card-foreground truncate">{user.name}</h3>
                    <StatusBadge status={user.status} size="sm" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {user.roleDisplay || user.role} · {user.specialty || 'General'}
                  </p>
                  <p className="text-xs text-muted-foreground">{getDepartmentName(user.departmentId)}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 border-t border-border pt-3">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Mail className="h-3 w-3" /><span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Phone className="h-3 w-3" /><span>{user.phone}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {users.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
          <p className="text-sm font-medium text-muted-foreground">No staff members found</p>
          <p className="mt-1 text-xs text-muted-foreground">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Modals */}
      <AddStaffModal isOpen={addModalOpen} onOpenChange={setAddModalOpen} />
      <EditStaffModal user={selectedUser} isOpen={editModalOpen} onOpenChange={setEditModalOpen} />
      <UserDetailModal 
        user={selectedUser} 
        isOpen={detailOpen} 
        onOpenChange={setDetailOpen}
        onEdit={(user) => {
          setSelectedUser(user);
          setEditModalOpen(true);
        }}
      />
    </div>
  );
};

export default UsersPage;
