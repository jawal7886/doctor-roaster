/**
 * File: pages/LeavesPage.tsx
 * Purpose: Leave management page with approve/reject actions and toast feedback.
 */

import { useState, useEffect } from 'react';
import { Calendar, Check, X, Plus, User, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import PageHeader from '@/components/shared/PageHeader';
import StatusBadge from '@/components/shared/StatusBadge';
import RequestLeaveModal from '@/components/modals/RequestLeaveModal';
import { useToast } from '@/hooks/use-toast';
import { getLeaveRequests, approveLeaveRequest, rejectLeaveRequest, LeaveRequest } from '@/services/leaveService';
import { useUser } from '@/contexts/UserContext';

const LeavesPage = () => {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadLeaves();
  }, []);

  useEffect(() => {
    const handleLeaveUpdated = () => {
      loadLeaves();
    };

    window.addEventListener('leaveUpdated', handleLeaveUpdated);
    
    return () => {
      window.removeEventListener('leaveUpdated', handleLeaveUpdated);
    };
  }, []);

  const loadLeaves = async () => {
    try {
      setLoading(true);
      const data = await getLeaveRequests();
      setLeaves(data);
      
      // Calculate stats
      const pending = data.filter(l => l.status === 'pending').length;
      const approved = data.filter(l => l.status === 'approved').length;
      const rejected = data.filter(l => l.status === 'rejected').length;
      setStats({ pending, approved, rejected });
    } catch (error) {
      console.error('Failed to load leaves:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leave requests',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (leaveId: number) => {
    try {
      await approveLeaveRequest(leaveId, currentUser?.id);
      toast({ 
        title: 'Leave Approved', 
        description: 'Leave request has been approved.' 
      });
      loadLeaves(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to approve leave request',
        variant: 'destructive'
      });
    }
  };

  const handleRejectClick = (leaveId: number) => {
    setSelectedLeaveId(leaveId);
    setRejectionReason('');
    setRejectDialogOpen(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedLeaveId) return;
    
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive'
      });
      return;
    }

    try {
      await rejectLeaveRequest(selectedLeaveId, rejectionReason, currentUser?.id);
      toast({ 
        title: 'Leave Rejected', 
        description: 'Leave request has been rejected.', 
        variant: 'destructive' 
      });
      setRejectDialogOpen(false);
      setSelectedLeaveId(null);
      setRejectionReason('');
      loadLeaves(); // Refresh the list
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reject leave request',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Leave Management"
        description="Review and manage staff leave requests"
        actions={
          <Button className="gap-2" onClick={() => setRequestModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Request Leave
          </Button>
        }
      />

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Pending</p>
          <p className="text-2xl font-bold text-warning">{stats.pending}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Approved</p>
          <p className="text-2xl font-bold text-success">{stats.approved}</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 shadow-card">
          <p className="text-xs text-muted-foreground">Rejected</p>
          <p className="text-2xl font-bold text-destructive">{stats.rejected}</p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading leave requests...</p>
            </div>
          </div>
        ) : leaves.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-card-foreground">No leave requests</p>
            <p className="text-xs text-muted-foreground mt-1">Leave requests will appear here once submitted</p>
          </div>
        ) : (
          <>
            <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr] gap-4 border-b border-border bg-muted/30 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <span>Staff Member</span>
              <span>Start Date</span>
              <span>End Date</span>
              <span>Status</span>
              <span>Approved/Rejected By</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="divide-y divide-border">
              {leaves.map((leave) => (
                <div key={leave.id} className="flex flex-col gap-3 px-5 py-4 sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1.5fr_1fr] sm:items-center sm:gap-4 transition-colors hover:bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {leave.userName?.split(' ').map((n) => n[0]).join('').slice(0, 2) || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{leave.userName || `User ${leave.userId}`}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{leave.reason}</p>
                      {leave.rejectionReason && (
                        <p className="text-xs text-destructive mt-1">
                          <span className="font-medium">Reason: </span>{leave.rejectionReason}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-card-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    {new Date(leave.startDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-card-foreground">{new Date(leave.endDate).toLocaleDateString()}</div>
                  <StatusBadge status={leave.status} />
                  <div className="text-sm">
                    {leave.approvedByName ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-card-foreground">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs">{leave.approvedByName}</span>
                        </div>
                        {leave.approvedAt && (
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Clock className="h-3.5 w-3.5" />
                            <span className="text-xs">{new Date(leave.approvedAt).toLocaleString()}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </div>
                  <div className="flex items-center justify-end gap-1.5">
                    {leave.status === 'pending' && (
                      <>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-success hover:bg-success/10" onClick={() => handleApprove(leave.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleRejectClick(leave.id)}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <RequestLeaveModal isOpen={requestModalOpen} onOpenChange={setRequestModalOpen} />

      {/* Rejection Reason Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Leave Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this leave request. This will be visible to the staff member.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter the reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              Reject Leave
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LeavesPage;
