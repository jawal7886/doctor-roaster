/**
 * File: components/modals/EditDepartmentModal.tsx
 * Purpose: Modal dialog for editing an existing department.
 */

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Department } from '@/types';

interface EditDepartmentModalProps {
  department: Department | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditDepartmentModal = ({ department, isOpen, onOpenChange }: EditDepartmentModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxHours, setMaxHours] = useState('40');
  const [color, setColor] = useState('#3b82f6');

  /** Populate form when department changes */
  useEffect(() => {
    if (department) {
      setName(department.name);
      setDescription(department.description);
      setMaxHours(department.maxHoursPerDoctor.toString());
      setColor(department.color);
    }
  }, [department]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department) return;

    setLoading(true);

    try {
      await api.put(`/departments/${department.id}`, {
        name,
        description,
        max_hours_per_doctor: parseInt(maxHours),
        color,
      });

      toast({
        title: 'Success!',
        description: `${name} department has been updated successfully.`,
      });

      onOpenChange(false);

      // Trigger page refresh
      window.dispatchEvent(new CustomEvent('departmentUpdated'));
    } catch (error: any) {
      console.error('Error updating department:', error);
      
      // Check for validation errors
      const errorMessage = error.response?.data?.errors?.name?.[0] 
        || error.response?.data?.message 
        || 'Failed to update department. Please try again.';
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!department) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Department</DialogTitle>
          <DialogDescription>Update department information.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="edit-dept-name">Department Name</Label>
            <Input 
              id="edit-dept-name" 
              placeholder="e.g. Radiology" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-dept-desc">Description</Label>
            <Textarea 
              id="edit-dept-desc" 
              placeholder="Brief description of the department" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="edit-dept-hours">Max Hours per Doctor (weekly)</Label>
              <Input 
                id="edit-dept-hours" 
                type="number" 
                min="20" 
                max="60" 
                value={maxHours} 
                onChange={(e) => setMaxHours(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="edit-dept-color">Department Color</Label>
              <Input 
                id="edit-dept-color" 
                type="color" 
                value={color} 
                onChange={(e) => setColor(e.target.value)}
                disabled={loading}
                className="h-10 cursor-pointer"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!name || loading}>
              {loading ? 'Updating...' : 'Update Department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditDepartmentModal;
