import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';

interface Supplier {
  id: string;
  business_name: string;
  rating: number;
  total_reviews: number;
  is_featured: boolean;
}

export const FeaturedRestaurantsManagement = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [mode, setMode] = useState<'automatic' | 'manual'>('automatic');
  const [limit, setLimit] = useState(5);
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    fetchSuppliers();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_value')
        .eq('setting_key', 'featured_restaurants_mode')
        .single();

      if (error) throw error;
      
      if (data?.setting_value) {
        const settings = data.setting_value as { mode: 'automatic' | 'manual'; limit: number };
        setMode(settings.mode);
        setLimit(settings.limit);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('id, business_name, rating, total_reviews, is_featured')
        .eq('is_active', true)
        .eq('is_verified', true)
        .order('rating', { ascending: false });

      if (error) throw error;
      setSuppliers(data || []);
      
      // Set currently featured suppliers as selected
      const featured = data?.filter(s => s.is_featured).map(s => s.id) || [];
      setSelectedSuppliers(featured);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to load suppliers');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Update settings
      const { error: settingsError } = await supabase
        .from('app_settings')
        .update({
          setting_value: { mode, limit }
        })
        .eq('setting_key', 'featured_restaurants_mode');

      if (settingsError) throw settingsError;

      if (mode === 'manual') {
        // Clear all featured first
        await supabase
          .from('suppliers')
          .update({ is_featured: false })
          .eq('is_featured', true);

        // Set selected as featured
        if (selectedSuppliers.length > 0) {
          const { error: updateError } = await supabase
            .from('suppliers')
            .update({ is_featured: true })
            .in('id', selectedSuppliers);

          if (updateError) throw updateError;
        }
      } else {
        // Automatic mode: feature top N by rating
        const topSuppliers = suppliers
          .sort((a, b) => b.rating - a.rating)
          .slice(0, limit)
          .map(s => s.id);

        // Clear all featured first
        await supabase
          .from('suppliers')
          .update({ is_featured: false })
          .eq('is_featured', true);

        // Set top rated as featured
        if (topSuppliers.length > 0) {
          const { error: updateError } = await supabase
            .from('suppliers')
            .update({ is_featured: true })
            .in('id', topSuppliers);

          if (updateError) throw updateError;
        }
      }

      toast.success('Featured restaurants settings saved successfully');
      fetchSuppliers();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleToggleSupplier = (supplierId: string) => {
    setSelectedSuppliers(prev => {
      if (prev.includes(supplierId)) {
        return prev.filter(id => id !== supplierId);
      } else {
        return [...prev, supplierId];
      }
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Featured Restaurants Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label className="text-base mb-4 block">Selection Mode</Label>
            <RadioGroup value={mode} onValueChange={(value: 'automatic' | 'manual') => setMode(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="automatic" id="automatic" />
                <Label htmlFor="automatic">Automatic (by rating & reviews)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="manual" id="manual" />
                <Label htmlFor="manual">Manual selection</Label>
              </div>
            </RadioGroup>
          </div>

          <div>
            <Label>Number of featured restaurants</Label>
            <Input
              type="number"
              min="1"
              max="20"
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
              className="w-32"
            />
          </div>

          {mode === 'automatic' && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Automatic mode:</strong> The system will automatically select the top {limit} restaurants 
                based on their average rating and number of reviews. This selection updates automatically as ratings change.
              </p>
            </div>
          )}

          {mode === 'manual' && (
            <div>
              <Label className="text-base mb-4 block">Select Restaurants to Feature</Label>
              <div className="space-y-2 max-h-96 overflow-y-auto border rounded-lg p-4">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="flex items-center justify-between p-3 hover:bg-muted rounded">
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        checked={selectedSuppliers.includes(supplier.id)}
                        onCheckedChange={() => handleToggleSupplier(supplier.id)}
                      />
                      <div>
                        <p className="font-medium">{supplier.business_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Rating: {supplier.rating.toFixed(1)} ⭐ ({supplier.total_reviews} reviews)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                Selected: {selectedSuppliers.length} restaurant(s)
              </p>
            </div>
          )}

          <Button onClick={handleSaveSettings}>
            Save Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currently Featured Restaurants</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {suppliers.filter(s => s.is_featured).map((supplier) => (
              <div key={supplier.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{supplier.business_name}</p>
                  <p className="text-sm text-muted-foreground">
                    Rating: {supplier.rating.toFixed(1)} ⭐ ({supplier.total_reviews} reviews)
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
