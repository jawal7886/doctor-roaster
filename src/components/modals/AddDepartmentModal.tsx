/**
 * File: components/modals/AddDepartmentModal.tsx
 * Purpose: Modal dialog for creating a new hospital department.
 */

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface AddDepartmentModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AddDepartmentModal = ({ isOpen, onOpenChange }: AddDepartmentModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxHours, setMaxHours] = useState('40');
  const [color, setColor] = useState('#3b82f6');

  const resetForm = () => {
    setName('');
    setDescription('');
    setMaxHours('40');
    setColor('#3b82f6');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/departments', {
        name,
        description,
        max_hours_per_doctor: parseInt(maxHours),
        color,
      });

      toast({
        title: 'Success!',
        description: `${name} department has been created successfully.`,
      });

      resetForm();
      onOpenChange(false);

      // Trigger page refresh
      window.dispatchEvent(new CustomEvent('departmentAdded'));
    } catch (error: any) {
      console.error('Error creating department:', error);
      
      // Check for validation errors
      const errorMessage = error.response?.data?.errors?.name?.[0] 
        || error.response?.data?.message 
        || 'Failed to create department. Please try again.';
      
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
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Add Department</DialogTitle>
          <DialogDescription>Create a new hospital department.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dept-name">Department Name</Label>
            <Input 
              id="dept-name" 
              placeholder="e.g. Radiology" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              required 
              disabled={loading}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dept-desc">Description</Label>
            <Textarea 
              id="dept-desc" 
              placeholder="Brief description of the department" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              rows={3}
              disabled={loading}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="dept-hours">Max Hours per Doctor (weekly)</Label>
              <Input 
                id="dept-hours" 
                type="number" 
                min="20" 
                max="60" 
                value={maxHours} 
                onChange={(e) => setMaxHours(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dept-color">Department Color</Label>
              <Input 
                id="dept-color" 
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
              {loading ? 'Creating...' : 'Create Department'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddDepartmentModal;
