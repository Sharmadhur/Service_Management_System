import { Outlet } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlineClipboardCheck, HiOutlineCash, HiOutlineSwitchHorizontal, HiOutlineUser } from 'react-icons/hi';
import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/worker', label: 'Dashboard', icon: <HiOutlineViewGrid size={18} />, end: true },
  { to: '/worker/jobs', label: 'Assigned jobs', icon: <HiOutlineClipboardCheck size={18} /> },
  { to: '/worker/earnings', label: 'Earnings', icon: <HiOutlineCash size={18} /> },
  { to: '/worker/availability', label: 'Availability', icon: <HiOutlineSwitchHorizontal size={18} /> },
  { to: '/worker/profile', label: 'Profile', icon: <HiOutlineUser size={18} /> },
];

export default function WorkerLayout() {
  return (
    <DashboardLayout title="Worker" links={links}>
      <Outlet />
    </DashboardLayout>
  );
}
