import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { SlideshowManagement } from '@/components/admin/SlideshowManagement';

const AdminSlideshowManagement = () => {
  return (
    <AdminDashboardLayout>
      <div className="w-full">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Slideshow Management</h1>
          <SlideshowManagement />
        </div>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminSlideshowManagement;
