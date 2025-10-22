import { supabase } from '@/integrations/supabase/client';

interface CreateAdminUserData {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  admin_key: string;
}

export const createAdminUser = async (data: CreateAdminUserData) => {
  try {
    console.log('Calling create-admin-user edge function...');
    
    const { data: result, error } = await supabase.functions.invoke('create-admin-user', {
      body: data
    });

    if (error) {
      console.error('Edge function error:', error);
      return { data: null, error };
    }

    console.log('Admin user created successfully:', result);
    return { data: result, error: null };

  } catch (error) {
    console.error('Unexpected error creating admin user:', error);
    return { 
      data: null, 
      error: { 
        message: error instanceof Error ? error.message : 'An unexpected error occurred' 
      } 
    };
  }
};