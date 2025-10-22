# Talabat Rwanda - Production Deployment Guide

## Prerequisites

- Supabase Production Project
- Domain name registered
- SSL certificate (handled by Lovable/Vercel automatically)
- Production environment access

## 1. Supabase Production Setup

### Create Production Project
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create new project for production
3. Choose appropriate region (closest to Rwanda/users)
4. Note down project credentials

### Database Migration
```bash
# Run the production migration script
psql -h your-production-host -U postgres -d postgres -f deployment/production-migration.sql
```

### Environment Variables Setup
1. Copy `.env.production` to `.env`
2. Update with your production Supabase credentials:
   ```
   VITE_SUPABASE_URL=https://your-production-ref.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=your-production-anon-key
   VITE_SUPABASE_PROJECT_ID=your-production-ref
   ```

### Storage Buckets
Create production storage buckets:
```sql
-- Product images bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('product-images', 'product-images', true);

-- Business images bucket  
INSERT INTO storage.buckets (id, name, public) VALUES ('business-images', 'business-images', true);
```

### Storage Policies
```sql
-- Product images policies
CREATE POLICY "Public can view product images" ON storage.objects
FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Suppliers can upload product images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'product-images' AND
  auth.uid() IN (
    SELECT user_id FROM suppliers WHERE id::text = (storage.foldername(name))[1]
  )
);

-- Business images policies
CREATE POLICY "Public can view business images" ON storage.objects
FOR SELECT USING (bucket_id = 'business-images');

CREATE POLICY "Suppliers can upload business images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'business-images' AND
  auth.uid() IN (
    SELECT user_id FROM suppliers WHERE id::text = (storage.foldername(name))[1]
  )
);
```

## 2. Security Configuration

### Edge Functions Secrets
Add required secrets in Supabase Dashboard > Edge Functions > Secrets:
```
RESEND_API_KEY=your-resend-api-key
ADMIN_CREATION_KEY=your-secure-admin-key
```

### Rate Limiting
The migration script includes basic rate limiting. For production, consider:
- Cloudflare rate limiting
- API Gateway rate limiting
- Application-level rate limiting in edge functions

### CORS Configuration
In Supabase Dashboard > Settings > API:
- Set CORS origins to your production domain
- Remove localhost origins

### RLS Policy Verification
All tables have proper RLS policies. Verify with:
```sql
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = false;
```

## 3. Performance Optimization

### Database Indexes
The migration script includes optimized indexes for:
- Geographic queries (suppliers by location)
- Order management queries
- Search functionality
- User role lookups

### Image Optimization
- Images are served from Supabase Storage CDN
- Consider image compression before upload
- Implement lazy loading for product images

### Query Optimization
- Use database indexes for frequent queries
- Implement pagination for large datasets
- Cache frequently accessed data

### Monitoring
- Enable Supabase Analytics
- Monitor slow queries via query_performance_log table
- Set up alerts for high error rates

## 4. Deployment Configuration

### Build Optimization
In `vite.config.ts`:
```typescript
export default defineConfig({
  build: {
    target: 'es2015',
    outDir: 'dist',
    assetsDir: 'assets',
    minify: 'terser',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-select']
        }
      }
    }
  }
});
```

### Static Asset Optimization
- Compress images before deployment
- Use WebP format where supported
- Implement proper caching headers

### Domain Setup
1. **Lovable Hosting:**
   - Go to Project Settings > Domains
   - Add your domain (e.g., talabat.rw)
   - Follow DNS configuration instructions
   - SSL is handled automatically

2. **Custom Hosting:**
   ```bash
   npm run build
   # Deploy dist/ folder to your hosting provider
   ```

### CDN Configuration
For custom hosting, configure CDN with:
- Cache static assets (JS, CSS, images) for 1 year
- Cache HTML for 1 hour
- Enable gzip compression

## 5. Environment-Specific Configuration

### Production Environment Variables
```bash
VITE_APP_ENV=production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_DEBUG_MODE=false
```

### Error Reporting
Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Google Analytics for usage tracking

## 6. Testing in Production

### Smoke Tests
1. User registration flows
2. Order placement workflow
3. Payment processing (if implemented)
4. Admin functions
5. Supplier management

### Performance Testing
- Load test with expected traffic
- Test database performance under load
- Verify CDN performance globally

### Security Testing
- Run security scan after deployment
- Test rate limiting
- Verify RLS policies
- Check for data leaks

## 7. Monitoring & Maintenance

### Health Checks
- Database connectivity
- Storage bucket access
- Edge function availability
- API response times

### Backup Strategy
- Supabase provides automated backups
- Consider additional backup for critical data
- Test restoration procedures

### Update Strategy
- Stage updates in development environment
- Run migration scripts during low-traffic periods
- Monitor for issues after deployment

## 8. Post-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database migration completed
- [ ] Storage buckets and policies set up
- [ ] Domain configured and SSL working
- [ ] All user flows tested
- [ ] Security scan passed
- [ ] Performance benchmarks met
- [ ] Monitoring and alerts configured
- [ ] Backup strategy verified
- [ ] Team trained on production procedures

## Support

For issues during deployment:
1. Check Supabase project logs
2. Verify environment configuration
3. Test database connectivity
4. Review security policies
5. Contact Supabase support if needed

## Security Best Practices

- Never commit production credentials to version control
- Use strong passwords for admin accounts
- Enable 2FA on all admin accounts
- Regularly update dependencies
- Monitor for suspicious activity
- Implement proper logging and auditing