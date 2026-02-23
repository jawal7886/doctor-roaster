/**
 * File: components/dashboard/DepartmentOverview.tsx
 * Purpose: Clickable department overview cards on the dashboard.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getDepartments } from '@/services/departmentService';
import { Department } from '@/types';
import { Building2, Users, ChevronRight } from 'lucide-react';

const DepartmentOverview = () => {
  const navigate = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(data.slice(0, 6)); // Show only first 6 departments
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-card">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-card-foreground">Departments</h3>
          <p className="text-xs text-muted-foreground">Active departments & staff count</p>
        </div>
        <button
          onClick={() => navigate('/departments')}
          className="text-xs font-medium text-primary hover:underline"
        >
          View All →
        </button>
      </div>
      {loading ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-r-transparent"></div>
            <p className="mt-2 text-xs text-muted-foreground">Loading departments...</p>
          </div>
        </div>
      ) : departments.length === 0 ? (
        <div className="flex items-center justify-center p-8">
          <p className="text-sm text-muted-foreground">No departments found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-3">
          {departments.map((dept) => (
            <div
              key={dept.id}
              onClick={() => navigate('/departments')}
              className="card-hover flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 group"
            >
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${dept.color}15`, color: dept.color }}
              >
                <Building2 className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-card-foreground truncate">{dept.name}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Users className="h-3 w-3" />
                  <span>{dept.doctorCount} doctors</span>
                </div>
              </div>
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentOverview;
