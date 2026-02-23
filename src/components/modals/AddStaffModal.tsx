/**
 * File: components/modals/AddStaffModal.tsx
 * Purpose: Modal dialog for adding a new staff member.
 * Includes form fields for name, email, role, specialty, and department.
 * Connected to Laravel backend API.
 */

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getDepartments } from '@/services/departmentService';
import { createUser } from '@/services/userService';
import { roleService, type Role } from '@/services/roleService';
import { specialtyService, type Specialty } from '@/services/specialtyService';
import { useToast } from '@/hooks/use-toast';
import { Department } from '@/types';

interface AddStaffModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddStaffModal = ({ isOpen, onOpenChange }: AddStaffModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [roleId, setRoleId] = useState('');
  const [specialtyId, setSpecialtyId] = useState('');
  const [department, setDepartment] = useState('');

  /** Fetch departments, roles, and specialties when modal opens */
  useEffect(() => {
    if (isOpen) {
      fetchDepartments();
      fetchRoles();
      fetchSpecialties();
    }
  }, [isOpen]);

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

  /** Reset form fields */
  const resetForm = () => {
    setName(''); setEmail(''); setPassword(''); setPhone('');
    setRoleId(''); setSpecialtyId(''); setDepartment('');
  };

  /** Handle form submission */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await createUser({
        name,
        email,
        password,
        phone,
        roleId: roleId ? parseInt(roleId) : null,
        specialtyId: specialtyId ? parseInt(specialtyId) : null,
        departmentId: department ? parseInt(department) : null,
        status: 'active',
      });

      toast({
        title: 'Success!',
        description: `${name} has been added successfully.`,
      });
      
      resetForm();
      onOpenChange(false);
      
      // Trigger page refresh by dispatching custom event
      window.dispatchEvent(new CustomEvent('userAdded'));
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      // Extract detailed error message
      let errorMessage = 'Failed to add staff member. Please try again.';
      
      if (error.response?.data?.errors) {
        // Laravel validation errors
        const errors = error.response.data.errors;
        const firstError = Object.values(errors)[0];
        errorMessage = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Staff Member</DialogTitle>
          <DialogDescription>Add a new doctor, nurse, or staff to the hospital system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="staff-name">Full Name</Label>
            <Input 
              id="staff-name" 
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
              <Label htmlFor="staff-email">Email</Label>
              <Input 
                id="staff-email" 
                type="email" 
                placeholder="jane@hospital.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="staff-phone">Phone</Label>
              <Input 
                id="staff-phone" 
                placeholder="+1-555-0100" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                required 
                disabled={loading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <Label htmlFor="staff-password">Password</Label>
            <Input 
              id="staff-password" 
              type="password" 
              placeholder="Enter password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              minLength={6}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">Minimum 6 characters</p>
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
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name || !email || !password || !roleId || loading}>
              {loading ? 'Adding...' : 'Add Staff Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddStaffModal;
