/**
 * File: components/modals/UserDetailModal.tsx
 * Purpose: Modal showing detailed info about a staff member.
 */

import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import StatusBadge from '@/components/shared/StatusBadge';
import { User } from '@/types';
import { ROLE_LABELS } from '@/constants';
import { getDepartmentName } from '@/services/departmentService';
import { deleteUser } from '@/services/userService';
import { useToast } from '@/hooks/use-toast';
import { Mail, Phone, Calendar, Building2, Edit, Trash2 } from 'lucide-react';

interface UserDetailModalProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (user: User) => void;
}

const UserDetailModal = ({ user, isOpen, onOpenChange, onEdit }: UserDetailModalProps) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!user) return null;

  const handleEdit = () => {
    onEdit(user);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteUser(user.id);
      toast({
        title: 'Success',
        description: `${user.name} has been removed successfully.`,
      });
      setShowDeleteDialog(false);
      onOpenChange(false);
      // Trigger page refresh
      window.dispatchEvent(new CustomEvent('userDeleted'));
    } catch (error: any) {
      console.error('Error deleting user:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to remove staff member.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Staff Details</DialogTitle>
          <DialogDescription>View and manage staff member information.</DialogDescription>
        </DialogHeader>
        <div className="space-y-5">
          {/* Profile header */}
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-lg font-bold text-primary">
              {user.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">{user.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">{ROLE_LABELS[user.role]}</Badge>
                <StatusBadge status={user.status} size="sm" />
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{user.phone}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{getDepartmentName(user.departmentId)} · {user.specialty || 'General'}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">Joined {new Date(user.joinDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleEdit}>
              <Edit className="h-4 w-4" /> Edit Profile
            </Button>
            <Button 
              variant="outline" 
              className="gap-2 text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" /> Remove
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove {user.name} from the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
};

export default UserDetailModal;
