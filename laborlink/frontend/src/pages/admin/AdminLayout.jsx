import { Outlet } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlineUsers, HiOutlineBriefcase, HiOutlineClipboardList, HiOutlineTag, HiOutlineChartBar } from 'react-icons/hi';
import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/admin', label: 'Dashboard', icon: <HiOutlineViewGrid size={18} />, end: true },
  { to: '/admin/users', label: 'Users', icon: <HiOutlineUsers size={18} /> },
  { to: '/admin/workers', label: 'Workers', icon: <HiOutlineBriefcase size={18} /> },
  { to: '/admin/requests', label: 'Requests', icon: <HiOutlineClipboardList size={18} /> },
  { to: '/admin/categories', label: 'Categories', icon: <HiOutlineTag size={18} /> },
  { to: '/admin/analytics', label: 'Analytics', icon: <HiOutlineChartBar size={18} /> },
];

export default function AdminLayout() {
  return (
    <DashboardLayout title="Admin" links={links}>
      <Outlet />
    </DashboardLayout>
  );
}
