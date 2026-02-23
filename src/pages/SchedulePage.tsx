/**
 * File: pages/SchedulePage.tsx
 * Purpose: Schedule and roster management with interactive calendar and assign shift modal.
 */

import { useState, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import PageHeader from '@/components/shared/PageHeader';
import AssignShiftModal from '@/components/modals/AssignShiftModal';
import EditScheduleModal from '@/components/modals/EditScheduleModal';
import { Department, ScheduleEntry } from '@/types';
import { getDepartments } from '@/services/departmentService';
import { getSchedules, deleteSchedule } from '@/services/scheduleService';
import { SHIFT_LABELS, SHIFT_TIMES } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

/** Generate days of the current week */
const getWeekDays = (startDate: Date) => {
  const days = [];
  const today = new Date().toISOString().split('T')[0];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      label: d.getDate().toString(),
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      isToday: dateStr === today,
    });
  }
  return days;
};

const SchedulePage = () => {
  const { toast } = useToast();
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(now.setDate(diff));
  });
  const [deptFilter, setDeptFilter] = useState<string>('all');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [view, setView] = useState<string>('week');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [schedules, setSchedules] = useState<ScheduleEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [scheduleToDelete, setScheduleToDelete] = useState<number | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<ScheduleEntry | null>(null);

  useEffect(() => {
    loadDepartments();
    loadSchedules();
  }, [weekStart, deptFilter]);

  useEffect(() => {
    const handleScheduleUpdated = () => {
      loadSchedules();
    };

    window.addEventListener('scheduleUpdated', handleScheduleUpdated);
    
    return () => {
      window.removeEventListener('scheduleUpdated', handleScheduleUpdated);
    };
  }, [weekStart, deptFilter]);

  const loadDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data);
    } catch (error) {
      console.error('Failed to load departments:', error);
    }
  };

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const startDate = weekStart.toISOString().split('T')[0];
      const endDate = new Date(weekStart.getTime() + 6 * 86400000).toISOString().split('T')[0];
      
      const data = await getSchedules({
        startDate,
        endDate,
        departmentId: deptFilter !== 'all' ? Number(deptFilter) : undefined,
      });
      
      setSchedules(data);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      toast({
        title: 'Error',
        description: 'Failed to load schedules',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async () => {
    if (!scheduleToDelete) return;

    try {
      await deleteSchedule(scheduleToDelete);
      toast({
        title: 'Schedule Deleted',
        description: 'The shift has been removed from the schedule.'
      });
      loadSchedules();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete schedule',
        variant: 'destructive'
      });
    } finally {
      setDeleteDialogOpen(false);
      setScheduleToDelete(null);
    }
  };

  const handleEntryClick = (entry: ScheduleEntry) => {
    toast({
      title: `${entry.userName} — ${SHIFT_LABELS[entry.shiftType]} Shift`,
      description: `${entry.departmentName} · ${entry.date} · Status: ${entry.status}${entry.isOnCall ? ' · On-Call' : ''}`,
    });
  };

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);

  const navigateWeek = (direction: number) => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + direction * 7);
      return next;
    });
  };

  const goToToday = () => {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    setWeekStart(new Date(now.setDate(diff)));
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Schedule & Roster"
        description="Manage shift assignments and duty rosters"
        actions={
          <Button className="gap-2" onClick={() => setAssignModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Assign Shift
          </Button>
        }
      />

      {/* Controls row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground min-w-[180px] text-center">
            {weekStart.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} –{' '}
            {new Date(weekStart.getTime() + 6 * 86400000).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateWeek(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={goToToday} className="ml-1 gap-1.5 text-xs">
            <CalendarIcon className="h-3.5 w-3.5" /> Today
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Tabs value={view} onValueChange={setView}>
            <TabsList className="h-9">
              <TabsTrigger value="week" className="text-xs px-3">Week</TabsTrigger>
              <TabsTrigger value="list" className="text-xs px-3">List</TabsTrigger>
            </TabsList>
          </Tabs>

          <Select value={deptFilter} onValueChange={setDeptFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Calendar grid view */}
      {view === 'week' && (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          <div className="grid grid-cols-7 border-b border-border">
            {weekDays.map((day) => (
              <div key={day.date} className={cn('border-r border-border px-3 py-3 text-center last:border-r-0', day.isToday && 'bg-primary/5')}>
                <p className="text-[10px] font-medium uppercase text-muted-foreground">{day.dayName}</p>
                <p className={cn('mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold', day.isToday ? 'bg-primary text-primary-foreground' : 'text-card-foreground')}>
                  {day.label}
                </p>
              </div>
            ))}
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading schedule...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-7">
              {weekDays.map((day) => {
                // Extract just the date part from the schedule dates for comparison
                const daySchedules = schedules.filter((s) => {
                  const scheduleDate = s.date.split('T')[0]; // Get YYYY-MM-DD part
                  return scheduleDate === day.date;
                });
                return (
                  <div key={day.date} className={cn('min-h-[160px] border-r border-border p-2 last:border-r-0', day.isToday && 'bg-primary/[0.02]')}>
                    {daySchedules.length > 0 ? (
                      daySchedules.map((entry) => (
                        <div
                          key={entry.id}
                          className={cn(
                            'group mb-2 cursor-pointer rounded-lg border p-2 text-xs transition-all hover:shadow-soft',
                            entry.shiftType === 'morning' && 'border-info/20 bg-info/5 hover:border-info/40',
                            entry.shiftType === 'evening' && 'border-warning/20 bg-warning/5 hover:border-warning/40',
                            entry.shiftType === 'night' && 'border-primary/20 bg-primary/5 hover:border-primary/40'
                          )}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0" onClick={() => handleEntryClick(entry)}>
                              <p className="font-medium text-card-foreground truncate">{entry.userName}</p>
                              <p className="text-muted-foreground mt-0.5">{SHIFT_LABELS[entry.shiftType]} · {SHIFT_TIMES[entry.shiftType].start}</p>
                              <p className="text-muted-foreground truncate">{entry.departmentName}</p>
                              {entry.isOnCall && <span className="mt-1 inline-block rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">On-Call</span>}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100">
                                  <MoreVertical className="h-3 w-3" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => {
                                  setScheduleToEdit(entry);
                                  setEditModalOpen(true);
                                }}>
                                  <Edit className="h-3 w-3 mr-2" />
                                  Edit Shift
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => {
                                  setScheduleToDelete(Number(entry.id));
                                  setDeleteDialogOpen(true);
                                }}>
                                  <Trash2 className="h-3 w-3 mr-2" />
                                  Delete Shift
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-[10px] text-muted-foreground/50">No shifts</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                <p className="mt-2 text-sm text-muted-foreground">Loading schedule...</p>
              </div>
            </div>
          ) : schedules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <CalendarIcon className="h-12 w-12 text-muted-foreground/50 mb-3" />
              <p className="text-sm font-medium text-card-foreground">No shifts scheduled</p>
              <p className="text-xs text-muted-foreground mt-1">Assign shifts to see them here</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_auto] gap-4 border-b border-border bg-muted/30 px-5 py-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <span>Doctor</span>
                <span>Date</span>
                <span>Shift</span>
                <span>Department</span>
                <span>Actions</span>
              </div>
              <div className="divide-y divide-border">
                {schedules.map((entry) => (
                  <div
                    key={entry.id}
                    className="grid grid-cols-[2fr_1fr_1.5fr_1.5fr_auto] items-center gap-4 px-5 py-3.5 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                        {entry.userName?.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <span className="text-sm font-medium text-card-foreground">{entry.userName}</span>
                    </div>
                    <span className="text-sm text-card-foreground">{entry.date}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'inline-block h-2 w-2 rounded-full',
                        entry.shiftType === 'morning' && 'bg-info',
                        entry.shiftType === 'evening' && 'bg-warning',
                        entry.shiftType === 'night' && 'bg-primary',
                      )} />
                      <span className="text-sm text-card-foreground">{SHIFT_LABELS[entry.shiftType]} ({SHIFT_TIMES[entry.shiftType].start}–{SHIFT_TIMES[entry.shiftType].end})</span>
                    </div>
                    <span className="text-sm text-card-foreground">{entry.departmentName}</span>
                    <div className="flex items-center gap-2">
                      {entry.isOnCall && <span className="rounded bg-destructive/10 px-1.5 py-0.5 text-[10px] font-medium text-destructive">On-Call</span>}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setScheduleToEdit(entry);
                            setEditModalOpen(true);
                          }}>
                            <Edit className="h-3 w-3 mr-2" />
                            Edit Shift
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => {
                            setScheduleToDelete(Number(entry.id));
                            setDeleteDialogOpen(true);
                          }}>
                            <Trash2 className="h-3 w-3 mr-2" />
                            Delete Shift
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <AssignShiftModal isOpen={assignModalOpen} onOpenChange={setAssignModalOpen} />
      <EditScheduleModal 
        schedule={scheduleToEdit} 
        isOpen={editModalOpen} 
        onOpenChange={setEditModalOpen} 
      />
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shift</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shift? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSchedule} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SchedulePage;
