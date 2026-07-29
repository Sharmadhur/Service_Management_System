import { Outlet } from 'react-router-dom';
import { HiOutlineViewGrid, HiOutlinePlusCircle, HiOutlineClipboardList, HiOutlineCreditCard, HiOutlineStar, HiOutlineUser } from 'react-icons/hi';
import DashboardLayout from '../../components/DashboardLayout';

const links = [
  { to: '/customer', label: 'Dashboard', icon: <HiOutlineViewGrid size={18} />, end: true },
  { to: '/customer/request', label: 'Request worker', icon: <HiOutlinePlusCircle size={18} /> },
  { to: '/customer/requests', label: 'My requests', icon: <HiOutlineClipboardList size={18} /> },
  { to: '/customer/payments', label: 'Payments', icon: <HiOutlineCreditCard size={18} /> },
  { to: '/customer/reviews', label: 'Reviews', icon: <HiOutlineStar size={18} /> },
  { to: '/customer/profile', label: 'Profile', icon: <HiOutlineUser size={18} /> },
];

export default function CustomerLayout() {
  return (
    <DashboardLayout title="Customer" links={links}>
      <Outlet />
    </DashboardLayout>
  );
}
