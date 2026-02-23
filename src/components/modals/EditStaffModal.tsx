/**
 * File: components/modals/EditStaffModal.tsx
 * Purpose: Modal dialog for editing an existing staff member.
 */

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { getDepartments } from '@/services/departmentService';
import { updateUser } from '@/services/userService';
import { roleService, type Role } from '@/services/roleService';
import { specialtyService, type Specialty } from '@/services/specialtyService';
import { useToast } from '@/hooks/use-toast';
import { Department, User, UserStatus } from '@/types';

interface EditStaffModalProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditStaffModal = ({ user, isOpen, onOpenChange }: EditStaffModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState<UserStatus>('active');

  /** Fetch departments, roles, and specialties when modal opens */
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchRoles();
      fetchSpecialties();
    }
  }, [isOpen]);

  /** Populate form when user changes */
  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone);
      setRoleId(user.roleId ? user.roleId.toString() : '');
      setSpecialtyId(user.specialtyId ? user.specialtyId.toString() : '');
      setDepartment(user.departmentId ? user.departmentId.toString() : '');
      setStatus(user.status);
    }
  }, [user]);

  const fetchDepartments = async () => {
    const depts = await getDepartments();
    setDepartments(depts);
  };

  const fetchRoles = async () => {
    try {
      const data = await roleService.getAll();
      setRoles(data.filter(r => r.is_active));
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchSpecialties = async () => {
    try {
      const data = await specialtyService.getAll();
      setSpecialties(data.filter(s => s.is_active));
    } catch (error) {
      console.error('Error fetching specialties:', error);
    }
  };

  /** Handle form submission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      await updateUser(user.id, {
        name,
        email,
        phone,
        roleId: roleId ? parseInt(roleId) : null,
        specialtyId: specialtyId ? parseInt(specialtyId) : null,
        departmentId: department ? parseInt(department) : null,
        status,
      });

      toast({
        title: 'Success!',
        description: `${name} has been updated successfully.`,
      });
      
      onOpenChange(false);
      
      // Trigger page refresh
      window.dispatchEvent(new CustomEvent('userUpdated'));
    } catch (error: any) {
      console.error('Error updating user:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to update staff member. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>Update staff member information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="edit-name">Full Name</Label>
            <Input 
              id="edit-name" 
              placeholder="Dr. Jane Doe" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
          
          {/* Email & Phone row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-email">Email</Label>
              <Input 
                id="edit-email" 
                type="email" 
                placeholder="jane@hospital.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-phone">Phone</Label>
              <Input 
                id="edit-phone" 
                placeholder="+1-555-0100" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Role */}
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={roleId} onValueChange={setRoleId} required disabled={loading}>
              <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
              <SelectContent>
                {roles.map((r) => (
                  <SelectItem key={r.id} value={r.id.toString()}>{r.display_name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Specialty & Department */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Specialty</Label>
              <Select value={specialtyId} onValueChange={setSpecialtyId} disabled={loading}>
                <SelectTrigger><SelectValue placeholder="Select specialty" /></SelectTrigger>
                <SelectContent>
                  {specialties.map((s) => (
                    <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={department} onValueChange={setDepartment} disabled={loading}>
                <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-4">
            <div className="space-y-0.5">
              <Label htmlFor="status-toggle" className="text-sm font-medium">
                Account Status
              </Label>
              <p className="text-xs text-muted-foreground">
                {status === 'active' ? 'User can access the system' : 'User cannot access the system'}
              </p>
            </div>
            <Switch
              id="status-toggle"
              checked={status === 'active'}
              onCheckedChange={(checked) => setStatus(checked ? 'active' : 'inactive')}
              disabled={loading}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name || !email || !roleId || loading}>
              {loading ? 'Updating...' : 'Update Staff Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditStaffModal;
