import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { FeaturedRestaurantsManagement } from '@/components/admin/FeaturedRestaurantsManagement';

const AdminFeaturedRestaurants = () => {
  return (
    <AdminDashboardLayout>
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Featured Restaurants Management</h1>
        <FeaturedRestaurantsManagement />
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminFeaturedRestaurants;
