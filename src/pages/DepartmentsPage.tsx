/**
 * File: pages/DepartmentsPage.tsx
 * Purpose: Manage hospital departments with interactive cards and add modal.
 */

import { useState, useEffect } from 'react';
import { Plus, Users, Clock, Building2, ChevronRight, MoreVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import PageHeader from '@/components/shared/PageHeader';
import AddDepartmentModal from '@/components/modals/AddDepartmentModal';
import EditDepartmentModal from '@/components/modals/EditDepartmentModal';
import DepartmentDetailModal from '@/components/modals/DepartmentDetailModal';
import { getDepartments } from '@/services/departmentService';
import { getUsers } from '@/services/userService';
import { Department } from '@/types';

const DepartmentsPage = () => {
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentStaffCounts, setDepartmentStaffCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    const handleDepartmentAdded = () => {
      fetchDepartments();
    };

    const handleDepartmentUpdated = () => {
      fetchDepartments();
    };

    const handleDepartmentDeleted = () => {
      fetchDepartments();
    };

    window.addEventListener('departmentAdded', handleDepartmentAdded);
    window.addEventListener('departmentUpdated', handleDepartmentUpdated);
    window.addEventListener('departmentDeleted', handleDepartmentDeleted);
    
    return () => {
      window.removeEventListener('departmentAdded', handleDepartmentAdded);
      window.removeEventListener('departmentUpdated', handleDepartmentUpdated);
      window.removeEventListener('departmentDeleted', handleDepartmentDeleted);
    };
  }, []);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      console.log('Fetching departments...');
      const [deptData, usersData] = await Promise.all([
        getDepartments(),
        getUsers(),
      ]);
      
      console.log('Departments fetched:', deptData);
      console.log('Users fetched:', usersData);
      
      // Calculate staff count for each department
      const staffCounts: Record<number, number> = {};
      usersData.forEach(user => {
        if (user.departmentId) {
          staffCounts[user.departmentId] = (staffCounts[user.departmentId] || 0) + 1;
        }
      });
      
      console.log('Staff counts:', staffCounts);
      
      setDepartments(deptData);
      setDepartmentStaffCounts(staffCounts);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Departments"
        description="Manage hospital departments and specialties"
        actions={
          <Button className="gap-2" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-2 text-sm text-muted-foreground">Loading departments...</p>
          </div>
        </div>
      ) : departments.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No departments found</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {departments.map((dept) => {
            const staffCount = departmentStaffCounts[dept.id] || 0;
            const head = dept.head;

            return (
              <div
                key={dept.id}
                className="card-hover group rounded-xl border border-border bg-card shadow-card overflow-hidden"
              >
                <div className="h-1.5" style={{ backgroundColor: dept.color }} />
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer"
                      onClick={() => {
                        setSelectedDepartment(dept);
                        setDetailModalOpen(true);
                      }}
                    >
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-lg"
                        style={{ backgroundColor: `${dept.color}15`, color: dept.color }}
                      >
                        <Building2 className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-card-foreground">{dept.name}</h3>
                        <p className="text-xs text-muted-foreground">{dept.description}</p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setSelectedDepartment(dept);
                          setDetailModalOpen(true);
                        }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedDepartment(dept);
                          setEditModalOpen(true);
                        }}>
                          Edit Department
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate(`/users?dept=${dept.id}`)}
                        >
                          View Staff
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" /><span>Doctors</span>
                      </div>
                      <p className="mt-1 text-lg font-bold text-card-foreground">{dept.doctorCount}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" /><span>Staff</span>
                      </div>
                      <p className="mt-1 text-lg font-bold text-card-foreground">{staffCount}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 px-3 py-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" /><span>Max Hrs</span>
                      </div>
                      <p className="mt-1 text-lg font-bold text-card-foreground">{dept.maxHoursPerDoctor}h</p>
                    </div>
                  </div>

                  {head && (
                    <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
                        {head.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-card-foreground">{head.name}</p>
                        <p className="text-[10px] text-muted-foreground">Department Head</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AddDepartmentModal isOpen={addModalOpen} onOpenChange={setAddModalOpen} />
      <EditDepartmentModal 
        department={selectedDepartment} 
        isOpen={editModalOpen} 
        onOpenChange={setEditModalOpen} 
      />
      <DepartmentDetailModal
        department={selectedDepartment}
        isOpen={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onEdit={(dept) => {
          setSelectedDepartment(dept);
          setEditModalOpen(true);
        }}
      />
    </div>
  );
};

export default DepartmentsPage;
