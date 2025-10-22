import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { authHelpers, type UserRole } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, Bug, CheckCircle, XCircle, Clock } from 'lucide-react';

interface DebugLog {
  timestamp: Date;
  level: 'info' | 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

export const RegistrationDebugger = () => {
  const [logs, setLogs] = useState<DebugLog[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Test form data
  const [testData, setTestData] = useState({
    email: 'debug@test.com',
    password: 'debugpassword123',
    fullName: 'Debug Test User',
    phone: '+250123456789',
    role: 'supplier' as UserRole,
    businessName: 'Debug Restaurant',
    businessType: 'restaurant',
    description: 'A test restaurant for debugging'
  });

  const addLog = (level: DebugLog['level'], message: string, data?: any) => {
    const newLog: DebugLog = {
      timestamp: new Date(),
      level,
      message,
      data
    };
    setLogs(prev => [...prev, newLog]);
    
    // Also log to browser console with different colors
    const colors = {
      info: 'color: blue',
      success: 'color: green', 
      error: 'color: red',
      warning: 'color: orange'
    };
    console.log(`%c[${level.toUpperCase()}] ${message}`, colors[level], data || '');
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const testUserCreation = async () => {
    setLoading(true);
    addLog('info', '🚀 STARTING REGISTRATION DEBUG TEST');
    
    try {
      // Prepare metadata
      const metadata = {
        first_name: testData.fullName.split(' ')[0] || '',
        last_name: testData.fullName.split(' ').slice(1).join(' ') || '',
        phone: testData.phone,
        role: testData.role,
        business_name: testData.businessName,
        business_type: testData.businessType,
        description: testData.description,
        address: 'Debug Address, Kigali',
        city: 'Kigali',
        latitude: -1.9441,
        longitude: 30.0619
      };

      addLog('info', '📋 Metadata prepared', metadata);

      // Test user creation
      addLog('info', '👤 Testing user creation...');
      const { data: authData, error: authError } = await authHelpers.signUp(
        testData.email,
        testData.password,
        metadata
      );

      if (authError) {
        addLog('error', '❌ User creation failed', authError);
        return;
      }

      addLog('success', '✅ User created successfully', {
        userId: authData.user?.id,
        hasSession: !!authData.session
      });

      const userId = authData.user?.id;
      if (!userId) {
        addLog('error', '❌ No user ID returned');
        return;
      }

      // Wait for trigger function
      addLog('info', '⏳ Waiting for database trigger to complete...');
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Check user_roles table
      addLog('info', '🔍 Checking user_roles table...');
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);

      if (roleError) {
        addLog('error', '❌ Error checking user_roles', roleError);
      } else {
        addLog('success', '✅ User roles found', roleData);
      }

      // Check users table
      addLog('info', '🔍 Checking users table...');
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId);

      if (userError) {
        addLog('error', '❌ Error checking users', userError);
      } else {
        addLog('success', '✅ User record found', userData);
      }

      // Check suppliers table (if supplier role)
      if (testData.role === 'supplier') {
        addLog('info', '🔍 Checking suppliers table...');
        const { data: supplierData, error: supplierError } = await supabase
          .from('suppliers')
          .select('*')
          .eq('user_id', userId);

        if (supplierError) {
          addLog('error', '❌ Error checking suppliers', supplierError);
        } else if (!supplierData || supplierData.length === 0) {
          addLog('error', '❌ No supplier record found');
        } else {
          addLog('success', '✅ Supplier record found', supplierData[0]);

          // Check subscription
          addLog('info', '🔍 Checking subscriptions table...');
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('supplier_id', supplierData[0].id);

          if (subError) {
            addLog('error', '❌ Error checking subscriptions', subError);
          } else if (!subData || subData.length === 0) {
            addLog('error', '❌ No subscription record found');
          } else {
            addLog('success', '✅ Subscription record found', subData[0]);
          }
        }
      }

      addLog('success', '🎉 DEBUG TEST COMPLETED');

    } catch (error) {
      addLog('error', '💥 Unexpected error during test', error);
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    addLog('info', '🔌 Testing database connection...');
    
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('count')
        .limit(1);
      
      if (error) {
        addLog('error', '❌ Database connection failed', error);
      } else {
        addLog('success', '✅ Database connection successful');
      }
    } catch (error) {
      addLog('error', '💥 Database connection error', error);
    }
  };

  const getLevelIcon = (level: DebugLog['level']) => {
    switch (level) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning': return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default: return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Registration Debugger
            </CardTitle>
            <CardDescription>
              Test registration flow and debug any issues with detailed logging
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Test Data Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Test Configuration</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={testData.email}
                      onChange={(e) => setTestData(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={testData.password}
                      onChange={(e) => setTestData(prev => ({ ...prev, password: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={testData.fullName}
                      onChange={(e) => setTestData(prev => ({ ...prev, fullName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={testData.phone}
                      onChange={(e) => setTestData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="role">Role</Label>
                  <Select
                    value={testData.role}
                    onValueChange={(value) => setTestData(prev => ({ ...prev, role: value as UserRole }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Customer</SelectItem>
                      <SelectItem value="supplier">Supplier</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {testData.role === 'supplier' && (
                  <>
                    <div>
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={testData.businessName}
                        onChange={(e) => setTestData(prev => ({ ...prev, businessName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Select
                        value={testData.businessType}
                        onValueChange={(value) => setTestData(prev => ({ ...prev, businessType: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="restaurant">Restaurant</SelectItem>
                          <SelectItem value="cafe">Cafe</SelectItem>
                          <SelectItem value="fast_food">Fast Food</SelectItem>
                          <SelectItem value="bakery">Bakery</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={testData.description}
                        onChange={(e) => setTestData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Control Panel */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Debug Controls</h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={testDatabaseConnection}
                    variant="outline"
                    disabled={loading}
                  >
                    Test DB Connection
                  </Button>
                  <Button
                    onClick={testUserCreation}
                    disabled={loading}
                  >
                    {loading ? 'Testing...' : 'Test Registration'}
                  </Button>
                </div>

                <Button
                  onClick={clearLogs}
                  variant="outline"
                  className="w-full"
                >
                  Clear Logs
                </Button>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    This will create a real user account. Make sure to use test data!
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Debug Logs */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Logs</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{logs.length} entries</Badge>
              <Badge variant="secondary">
                {logs.filter(l => l.level === 'error').length} errors
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No logs yet. Run a test to see debug information.
                </p>
              ) : (
                logs.map((log, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded border-l-4 ${
                      log.level === 'error' ? 'border-red-500 bg-red-50' :
                      log.level === 'success' ? 'border-green-500 bg-green-50' :
                      log.level === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                      'border-blue-500 bg-blue-50'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {getLevelIcon(log.level)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-mono text-muted-foreground">
                            {log.timestamp.toLocaleTimeString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {log.level}
                          </Badge>
                        </div>
                        <p className="mt-1 font-medium">{log.message}</p>
                        {log.data && (
                          <pre className="mt-2 text-xs bg-white p-2 rounded border overflow-x-auto">
                            {JSON.stringify(log.data, null, 2)}
                          </pre>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegistrationDebugger;