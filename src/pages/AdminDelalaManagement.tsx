import React, { useState, useEffect } from 'react';
import { AdminDashboardLayout } from '@/components/layouts/AdminDashboardLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ExternalLink, CheckCircle, XCircle, Flag, Trash2, Star, Eye, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';

interface Report {
  id: string;
  listing_id: string;
  reported_by: string;
  reason: string;
  description: string;
  created_at: string;
  status: string;
  delala_listings?: {
    title_ar: string;
    title_en: string;
    status: string;
  };
  users?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface Listing {
  id: string;
  title_ar: string;
  title_en: string;
  price: number;
  currency: string;
  status: string;
  is_featured: boolean;
  is_approved: boolean;
  views_count: number;
  created_at: string;
  user_id: string;
  category: string;
  condition: string;
  location_city: string;
}

const AdminDelalaManagement = () => {
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('reports');
  
  // Filters for listings
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    if (selectedTab === 'reports') {
      fetchReports();
    } else {
      fetchListings();
    }
  }, [selectedTab]);

  const fetchReports = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from('delala_reports')
      .select(`
        *,
        delala_listings(title_ar, title_en, status),
        users:reported_by(first_name, last_name, email)
      `)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load reports'
      });
    } else {
      setReports(data as any || []);
    }
    setLoading(false);
  };

  const fetchListings = async () => {
    setLoading(true);
    let query = (supabase as any)
      .from('delala_listings')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (searchQuery) {
      query = query.or(`title_ar.ilike.%${searchQuery}%,title_en.ilike.%${searchQuery}%`);
    }

    if (categoryFilter !== 'all') {
      query = query.eq('category', categoryFilter);
    }

    const { data, error } = await query;

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load listings'
      });
    } else {
      setListings(data as any || []);
    }
    setLoading(false);
  };

  const handleDismissReport = async (reportId: string) => {
    const { error } = await (supabase as any)
      .from('delala_reports')
      .update({ status: 'dismissed', reviewed_at: new Date().toISOString() })
      .eq('id', reportId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to dismiss report'
      });
    } else {
      toast({
        title: 'تم رفض البلاغ',
        description: 'Report dismissed successfully'
      });
      fetchReports();
    }
  };

  const handleRemoveListing = async (reportId: string, listingId: string) => {
    const { error: listingError } = await (supabase as any)
      .from('delala_listings')
      .update({ status: 'removed' })
      .eq('id', listingId);

    if (!listingError) {
      await (supabase as any)
        .from('delala_reports')
        .update({ status: 'resolved', reviewed_at: new Date().toISOString() })
        .eq('id', reportId);

      toast({
        title: 'تم إزالة الإعلان',
        description: 'Listing removed successfully'
      });
      fetchReports();
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to remove listing'
      });
    }
  };

  const handleToggleFeature = async (listingId: string, currentStatus: boolean) => {
    const { error } = await (supabase as any)
      .from('delala_listings')
      .update({ is_featured: !currentStatus })
      .eq('id', listingId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update listing'
      });
    } else {
      toast({
        title: 'تم التحديث',
        description: currentStatus ? 'Listing unfeatured' : 'Listing featured'
      });
      fetchListings();
    }
  };

  const handleToggleApprove = async (listingId: string, currentStatus: boolean) => {
    const { error } = await (supabase as any)
      .from('delala_listings')
      .update({ is_approved: !currentStatus })
      .eq('id', listingId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update listing'
      });
    } else {
      toast({
        title: 'تم التحديث',
        description: currentStatus ? 'Listing unapproved' : 'Listing approved'
      });
      fetchListings();
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    const { error } = await (supabase as any)
      .from('delala_listings')
      .delete()
      .eq('id', listingId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to delete listing'
      });
    } else {
      toast({
        title: 'تم الحذف',
        description: 'Listing deleted permanently'
      });
      fetchListings();
    }
  };

  const handleChangeListingStatus = async (listingId: string, newStatus: string) => {
    const { error } = await (supabase as any)
      .from('delala_listings')
      .update({ status: newStatus })
      .eq('id', listingId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update status'
      });
    } else {
      toast({
        title: 'تم التحديث',
        description: 'Status updated successfully'
      });
      fetchListings();
    }
  };

  return (
    <AdminDashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">إدارة دلالة / Delala Management</h1>
          <p className="text-muted-foreground">Moderate listings and handle reports</p>
        </div>

        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="reports">
              <Flag className="h-4 w-4 mr-2" />
              البلاغات / Reports
            </TabsTrigger>
            <TabsTrigger value="listings">
              كل الإعلانات / All Listings
            </TabsTrigger>
          </TabsList>

          {/* Pending Reports Tab */}
          <TabsContent value="reports" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>البلاغات المعلقة / Pending Reports</CardTitle>
                <CardDescription>Review and moderate reported listings</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : reports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Flag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No pending reports</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <Card key={report.id}>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">
                                {report.delala_listings?.title_ar || report.delala_listings?.title_en || 'Unknown Listing'}
                              </CardTitle>
                              <CardDescription>
                                <span className="font-semibold">Reporter:</span> {report.users?.first_name} {report.users?.last_name} ({report.users?.email})
                              </CardDescription>
                            </div>
                            <Link to={`/delala/${report.listing_id}`} target="_blank">
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                View Listing
                                <ExternalLink className="h-3 w-3 ml-2" />
                              </Button>
                            </Link>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <span className="font-semibold">Reason:</span>
                            <Badge variant="destructive" className="ml-2">{report.reason}</Badge>
                          </div>
                          {report.description && (
                            <div>
                              <span className="font-semibold">Description:</span>
                              <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                            </div>
                          )}
                          <div className="text-sm text-muted-foreground">
                            Reported: {format(new Date(report.created_at), 'PPp')}
                          </div>
                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDismissReport(report.id)}
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Dismiss Report
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remove Listing
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Listing?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will mark the listing as removed. This action can be reversed later.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleRemoveListing(report.id, report.listing_id)}
                                  >
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* All Listings Tab */}
          <TabsContent value="listings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>كل الإعلانات / All Listings</CardTitle>
                <CardDescription>Manage all Delala listings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Search</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search listings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Status</label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="sold">Sold</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="removed">Removed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Category</label>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="electronics">Electronics</SelectItem>
                        <SelectItem value="vehicles">Vehicles</SelectItem>
                        <SelectItem value="furniture">Furniture</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                        <SelectItem value="real-estate">Real Estate</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button onClick={fetchListings} variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Apply Filters
                </Button>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : listings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No listings found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Views</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {listings.map((listing) => (
                        <TableRow key={listing.id}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{listing.title_ar}</div>
                              <div className="text-sm text-muted-foreground">{listing.title_en}</div>
                              {listing.is_featured && (
                                <Badge variant="default" className="text-xs">
                                  <Star className="h-3 w-3 mr-1" />
                                  Featured
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {listing.price} {listing.currency}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                listing.status === 'active'
                                  ? 'default'
                                  : listing.status === 'sold'
                                  ? 'secondary'
                                  : 'outline'
                              }
                            >
                              {listing.status}
                            </Badge>
                          </TableCell>
                          <TableCell>{listing.views_count}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(listing.created_at), 'PP')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Link to={`/delala/${listing.id}`} target="_blank">
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </Link>
                              <Button
                                variant={listing.is_approved ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleToggleApprove(listing.id, listing.is_approved)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              <Button
                                variant={listing.is_featured ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleToggleFeature(listing.id, listing.is_featured)}
                              >
                                <Star className="h-4 w-4" />
                              </Button>
                              <Select
                                value={listing.status}
                                onValueChange={(value) => handleChangeListingStatus(listing.id, value)}
                              >
                                <SelectTrigger className="w-32 h-9">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="sold">Sold</SelectItem>
                                  <SelectItem value="removed">Removed</SelectItem>
                                  <SelectItem value="draft">Draft</SelectItem>
                                </SelectContent>
                              </Select>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="sm">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will permanently delete the listing. This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteListing(listing.id)}
                                      className="bg-destructive text-destructive-foreground"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminDashboardLayout>
  );
};

export default AdminDelalaManagement;
