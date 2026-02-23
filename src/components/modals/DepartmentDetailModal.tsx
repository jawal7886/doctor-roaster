/**
 * File: components/modals/DepartmentDetailModal.tsx
 * Purpose: Modal showing detailed info about a department with edit/delete actions.
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
import { Button } from '@/components/ui/button';
import { Department } from '@/types';
import api from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Building2, Users, Clock, Edit, Trash2 } from 'lucide-react';

interface DepartmentDetailModalProps {
  department: Department | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (department: Department) => void;
}

const DepartmentDetailModal = ({ department, isOpen, onOpenChange, onEdit }: DepartmentDetailModalProps) => {
  const { toast } = useToast();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!department) return null;

  const handleEdit = () => {
    onEdit(department);
    onOpenChange(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/departments/${department.id}`);
      toast({
        title: 'Success',
        description: `${department.name} has been deleted successfully.`,
      });
      setShowDeleteDialog(false);
      onOpenChange(false);
      // Trigger page refresh
      window.dispatchEvent(new CustomEvent('departmentDeleted'));
    } catch (error: any) {
      console.error('Error deleting department:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete department.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Department Details</DialogTitle>
            <DialogDescription>View and manage department information.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            {/* Department header */}
            <div className="flex items-center gap-4">
              <div 
                className="flex h-14 w-14 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${department.color}15`, color: department.color }}
              >
                <Building2 className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">{department.name}</h3>
                <p className="text-sm text-muted-foreground">{department.description}</p>
              </div>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-3 gap-3 rounded-lg border border-border p-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Users className="h-3 w-3" />
                  <span>Doctors</span>
                </div>
                <p className="text-2xl font-bold text-card-foreground">{department.doctorCount}</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Users className="h-3 w-3" />
                  <span>Staff</span>
                </div>
                <p className="text-2xl font-bold text-card-foreground">0</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Clock className="h-3 w-3" />
                  <span>Max Hrs</span>
                </div>
                <p className="text-2xl font-bold text-card-foreground">{department.maxHoursPerDoctor}h</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 gap-2" onClick={handleEdit}>
                <Edit className="h-4 w-4" /> Edit Department
              </Button>
              <Button 
                variant="outline" 
                className="gap-2 text-destructive hover:bg-destructive/10"
                onClick={() => setShowDeleteDialog(true)}
              >
                <Trash2 className="h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {department.name} department. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DepartmentDetailModal;
