import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';

import Home from './pages/public/Home';
import About from './pages/public/About';
import Services from './pages/public/Services';
import Contact from './pages/public/Contact';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

import CustomerLayout from './pages/customer/CustomerLayout';
import CustomerDashboard from './pages/customer/Dashboard';
import RequestWorker from './pages/customer/RequestWorker';
import MyRequests from './pages/customer/MyRequests';
import Payments from './pages/customer/Payments';
import CustomerReviews from './pages/customer/Reviews';
import CustomerProfile from './pages/customer/Profile';

import WorkerLayout from './pages/worker/WorkerLayout';
import WorkerDashboard from './pages/worker/Dashboard';
import AssignedJobs from './pages/worker/AssignedJobs';
import Earnings from './pages/worker/Earnings';
import Availability from './pages/worker/Availability';
import WorkerProfile from './pages/worker/Profile';

import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import Users from './pages/admin/Users';
import Workers from './pages/admin/Workers';
import Requests from './pages/admin/Requests';
import Categories from './pages/admin/Categories';
import Analytics from './pages/admin/Analytics';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/services" element={<Services />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Customer */}
      <Route
        path="/customer"
        element={<ProtectedRoute allowedRoles={['customer']}><CustomerLayout /></ProtectedRoute>}
      >
        <Route index element={<CustomerDashboard />} />
        <Route path="request" element={<RequestWorker />} />
        <Route path="requests" element={<MyRequests />} />
        <Route path="payments" element={<Payments />} />
        <Route path="reviews" element={<CustomerReviews />} />
        <Route path="profile" element={<CustomerProfile />} />
      </Route>

      {/* Worker */}
      <Route
        path="/worker"
        element={<ProtectedRoute allowedRoles={['worker']}><WorkerLayout /></ProtectedRoute>}
      >
        <Route index element={<WorkerDashboard />} />
        <Route path="jobs" element={<AssignedJobs />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="availability" element={<Availability />} />
        <Route path="profile" element={<WorkerProfile />} />
      </Route>

      {/* Admin */}
      <Route
        path="/admin"
        element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="workers" element={<Workers />} />
        <Route path="requests" element={<Requests />} />
        <Route path="categories" element={<Categories />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>

      <Route path="*" element={<Home />} />
    </Routes>
  );
}
