/**
 * File: components/modals/EditScheduleModal.tsx
 * Purpose: Modal dialog for editing an existing schedule entry.
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
import { SHIFT_LABELS } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { ShiftType, User, Department, ScheduleEntry } from '@/types';
import { getUsers } from '@/services/userService';
import { getDepartments } from '@/services/departmentService';
import { updateSchedule } from '@/services/scheduleService';

interface EditScheduleModalProps {
  schedule: ScheduleEntry | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const EditScheduleModal = ({ schedule, isOpen, onOpenChange }: EditScheduleModalProps) => {
  const { toast } = useToast();
  const [userId, setUserId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [shiftType, setShiftType] = useState<string>('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState<string>('scheduled');
  const [isOnCall, setIsOnCall] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && schedule) {
      // Set initial values from schedule immediately
      setUserId(schedule.userId);
      setDepartmentId(schedule.departmentId);
      setShiftType(schedule.shiftType);
      setDate(schedule.date.split('T')[0]); // Extract date part
      setStatus(schedule.status);
      setIsOnCall(schedule.isOnCall);
      
      // Load users and departments
      loadData();
    }
  }, [isOpen, schedule]);

  const loadData = async () => {
    try {
      const [usersData, deptsData] = await Promise.all([
        getUsers(),
        getDepartments()
      ]);
      setUsers(usersData);
      setDepartments(deptsData);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load data',
        variant: 'destructive'
      });
    }
  };

  const doctors = users.filter((u) => u.role === 'doctor' || u.role === 'department_head');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schedule || !userId || !shiftType || !date) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      await updateSchedule(Number(schedule.id), {
        userId,
        date,
        departmentId: departmentId || undefined,
        shiftType: shiftType as ShiftType,
        status: status as any,
        isOnCall,
      });

      const user = users.find((u) => u.id === userId);
      
      toast({ 
        title: 'Schedule Updated Successfully', 
        description: `${SHIFT_LABELS[shiftType as ShiftType]} shift updated for ${user?.name} on ${date}${isOnCall ? ' (On-Call)' : ''}.` 
      });
      
      // Dispatch event to refresh schedule data
      window.dispatchEvent(new Event('scheduleUpdated'));
      
      onOpenChange(false);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update schedule';
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

  if (!schedule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Edit Schedule</DialogTitle>
          <DialogDescription>Update the shift assignment details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Doctor</Label>
            <Select value={userId?.toString() || ''} onValueChange={(val) => setUserId(Number(val))} required>
              <SelectTrigger><SelectValue placeholder="Select a doctor" /></SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id.toString()}>{d.name} — {d.specialty}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Department</Label>
              <Select value={departmentId?.toString() || ''} onValueChange={(val) => setDepartmentId(Number(val))}>
                <SelectTrigger><SelectValue placeholder="Department" /></SelectTrigger>
                <SelectContent>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id.toString()}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Shift</Label>
              <Select value={shiftType} onValueChange={setShiftType} required>
                <SelectTrigger><SelectValue placeholder="Shift type" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(SHIFT_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="edit-shift-date">Date</Label>
            <Input id="edit-shift-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="swapped">Swapped</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <Label className="text-sm font-medium">On-Call Duty</Label>
              <p className="text-xs text-muted-foreground">Mark as available for emergency calls</p>
            </div>
            <Switch checked={isOnCall} onCheckedChange={setIsOnCall} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={!userId || !shiftType || !date || loading}>
              {loading ? 'Updating...' : 'Update Schedule'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditScheduleModal;
