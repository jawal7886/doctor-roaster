/**
 * File: pages/ReportsPage.tsx
 * Purpose: Analytics and reports page with charts and data visualization.
 */

import { useState, useEffect } from 'react';
import { Download, BarChart3, Users, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '@/components/shared/PageHeader';
import { useToast } from '@/hooks/use-toast';
import {
  getOverviewStats,
  getDepartmentDutyHours,
  exportReport,
  type OverviewStats,
  type DepartmentDutyHours,
} from '@/services/reportService';

const ReportsPage = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [departments, setDepartments] = useState<DepartmentDutyHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const [overviewData, deptData] = await Promise.all([
        getOverviewStats(),
        getDepartmentDutyHours(),
      ]);
      setStats(overviewData);
      setDepartments(deptData);
    } catch (error) {
      console.error('Failed to load reports:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reports data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      await exportReport('department_duty_hours');
      toast({
        title: 'Success',
        description: 'Report exported successfully',
      });
    } catch (error) {
      console.error('Failed to export report:', error);
      toast({
        title: 'Error',
        description: 'Failed to export report',
        variant: 'destructive',
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Reports & Analytics"
        description="Department-wise duty hours, schedules, and coverage reports"
        actions={
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleExport}
            disabled={exporting || loading}
          >
            <Download className="h-4 w-4" />
            {exporting ? 'Exporting...' : 'Export Report'}
          </Button>
        }
      />

      {/* Summary stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { 
            label: 'Total Duty Hours', 
            value: loading ? '...' : `${stats?.totalDutyHours || 0}h`, 
            icon: Clock, 
            color: 'bg-primary/10 text-primary' 
          },
          { 
            label: 'Shifts This Week', 
            value: loading ? '...' : stats?.shiftsThisWeek || 0, 
            icon: Calendar, 
            color: 'bg-info/10 text-info' 
          },
          { 
            label: 'Staff on Leave', 
            value: loading ? '...' : stats?.staffOnLeave || 0, 
            icon: Users, 
            color: 'bg-warning/10 text-warning' 
          },
          { 
            label: 'Coverage Rate', 
            value: loading ? '...' : `${stats?.coverageRate || 0}%`, 
            icon: BarChart3, 
            color: 'bg-success/10 text-success' 
          },
        ].map((stat) => (
          <div key={stat.label} className="card-hover rounded-xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-card-foreground">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Department duty hours table */}
      <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
        <div className="border-b border-border px-5 py-4">
          <h3 className="text-sm font-semibold text-card-foreground">Department Duty Hours</h3>
          <p className="text-xs text-muted-foreground">Weekly breakdown by department</p>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-sm text-muted-foreground">Loading departments...</p>
          </div>
        ) : departments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm font-medium text-card-foreground">No departments found</p>
            <p className="text-xs text-muted-foreground mt-1">Add departments to see reports</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-5 py-3 text-left">Department</th>
                  <th className="px-5 py-3 text-center">Doctors</th>
                  <th className="px-5 py-3 text-center">Max Hours</th>
                  <th className="px-5 py-3 text-center">Used Hours</th>
                  <th className="px-5 py-3 text-center">Coverage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {departments.map((dept) => (
                  <tr key={dept.departmentId} className="transition-colors hover:bg-muted/30">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: dept.departmentColor }}
                        />
                        <span className="text-sm font-medium text-card-foreground">{dept.departmentName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center text-sm text-card-foreground">{dept.doctors}</td>
                    <td className="px-5 py-3.5 text-center text-sm text-card-foreground">{dept.maxHours}h</td>
                    <td className="px-5 py-3.5 text-center text-sm text-card-foreground">{dept.usedHours}h</td>
                    <td className="px-5 py-3.5 text-center">
                      {/* Coverage bar */}
                      <div className="mx-auto flex items-center gap-2 max-w-[120px]">
                        <div className="h-1.5 flex-1 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-success transition-all"
                            style={{ width: `${dept.coverage}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-card-foreground">{dept.coverage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
