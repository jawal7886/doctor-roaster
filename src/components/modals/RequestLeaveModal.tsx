/**
 * File: components/modals/RequestLeaveModal.tsx
 * Purpose: Modal dialog for requesting leave.
 */

import { useState, useEffect } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { User } from '@/types';
import { getUsers } from '@/services/userService';
import { createLeaveRequest } from '@/services/leaveService';

interface RequestLeaveModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const RequestLeaveModal = ({ isOpen, onOpenChange }: RequestLeaveModalProps) => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<number | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || !startDate || !endDate || !reason) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      await createLeaveRequest({
        userId,
        startDate,
        endDate,
        reason,
      });

      const user = users.find((u) => u.id === userId);
      
      toast({ 
        title: 'Leave Request Submitted', 
        description: `Leave request for ${user?.name} has been submitted successfully.` 
      });
      
      // Dispatch event to refresh leave data
      window.dispatchEvent(new Event('leaveUpdated'));
      
      // Reset form
      setUserId(null);
      setStartDate('');
      setEndDate('');
      setReason('');
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to submit leave request';
      const errors = error.response?.data?.errors;
      
      let description = errorMessage;
      if (errors) {
        description = Object.values(errors).flat().join(', ');
      }
      
      toast({
        title: 'Error',
        description,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
          <DialogDescription>Submit a leave request for approval.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Staff Member</Label>
            <Select value={userId?.toString() || ''} onValueChange={(val) => setUserId(Number(val))} required>
              <SelectTrigger><SelectValue placeholder="Select staff member" /></SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} — {user.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="start-date">Start Date</Label>
              <Input 
                id="start-date" 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                min={new Date().toISOString().split('T')[0]}
                required 
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="end-date">End Date</Label>
              <Input 
                id="end-date" 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                min={startDate || new Date().toISOString().split('T')[0]}
                required 
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="reason">Reason for Leave</Label>
            <Textarea 
              id="reason" 
              placeholder="Please provide a reason for your leave request..."
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              rows={4}
              maxLength={500}
              required 
            />
            <p className="text-xs text-muted-foreground">{reason.length}/500 characters</p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={!userId || !startDate || !endDate || !reason || loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default RequestLeaveModal;
