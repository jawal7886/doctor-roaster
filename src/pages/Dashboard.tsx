/**
 * File: pages/Dashboard.tsx
 * Purpose: Main dashboard with clickable KPI stats, today's schedule, activity, and departments.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Stethoscope, CalendarCheck, AlertTriangle } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import TodaySchedule from '@/components/dashboard/TodaySchedule';
import RecentActivity from '@/components/dashboard/RecentActivity';
import DepartmentOverview from '@/components/dashboard/DepartmentOverview';
import { getUsers } from '@/services/userService';
import { getDepartments } from '@/services/departmentService';
import { getSchedules } from '@/services/scheduleService';
import { getLeaveRequests } from '@/services/leaveService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalDoctors: 0,
    activeStaff: 0,
    shiftsToday: 0,
    pendingLeaves: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      
      const [users, departments, todaySchedules, leaves] = await Promise.all([
        getUsers(),
        getDepartments(),
        getSchedules({ startDate: today, endDate: today }),
        getLeaveRequests({ status: 'pending' }),
      ]);

      // Calculate stats from real data
      const doctors = users.filter(u => u.role === 'doctor' || u.role === 'department_head');
      const activeUsers = users.filter(u => u.status === 'active');

      setStats({
        totalDoctors: doctors.length,
        activeStaff: activeUsers.length,
        shiftsToday: todaySchedules.length,
        pendingLeaves: leaves.length,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Stats Row — clickable */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="cursor-pointer" onClick={() => navigate('/users?role=doctor')}>
          <StatCard
            title="Total Doctors"
            value={loading ? '...' : stats.totalDoctors}
            change=""
            changeType="neutral"
            icon={<Stethoscope className="h-5 w-5" />}
            accentClass="bg-primary/10 text-primary"
          />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/users')}>
          <StatCard
            title="Active Staff"
            value={loading ? '...' : stats.activeStaff}
            change=""
            changeType="positive"
            icon={<Users className="h-5 w-5" />}
            accentClass="bg-accent/10 text-accent"
          />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/schedule')}>
          <StatCard
            title="Shifts Today"
            value={loading ? '...' : stats.shiftsToday}
            change=""
            changeType="neutral"
            icon={<CalendarCheck className="h-5 w-5" />}
            accentClass="bg-info/10 text-info"
          />
        </div>
        <div className="cursor-pointer" onClick={() => navigate('/leaves')}>
          <StatCard
            title="Pending Leaves"
            value={loading ? '...' : stats.pendingLeaves}
            change=""
            changeType="neutral"
            icon={<AlertTriangle className="h-5 w-5" />}
            accentClass="bg-warning/10 text-warning"
          />
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TodaySchedule />
        </div>
        <div>
          <RecentActivity />
        </div>
      </div>

      <DepartmentOverview />
    </div>
  );
};

export default Dashboard;
