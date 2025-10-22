-- Update Syrian Shawarma to Restaurant category
UPDATE suppliers 
SET business_type = '9fc3f8d1-1266-4b66-b649-eb3b8020d49b'
WHERE business_name = 'Syrian Shawarma';

-- Update Tech2Go to Electronics category  
UPDATE suppliers 
SET business_type = '73f58ae4-6c0e-4931-bcd5-72aa194d1924'
WHERE business_name = 'Tech2Go';

-- Update Kigali Safety Gas to Others category (since there's no Gas Retail category)
UPDATE suppliers 
SET business_type = '32e2ef93-39c3-45be-b5a2-8c2bcdceadad'
WHERE business_name = 'Kigali Safety Gas';