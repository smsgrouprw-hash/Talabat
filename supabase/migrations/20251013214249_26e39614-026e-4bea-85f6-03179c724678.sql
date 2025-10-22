-- Update test suppliers with varied Kigali neighborhood coordinates

-- Kigali Safety Gas - Gasabo District
UPDATE suppliers 
SET latitude = -1.9355, longitude = 30.0925
WHERE business_name = 'Kigali Safety Gas';

-- Tech2go phone lab - Remera area
UPDATE suppliers 
SET latitude = -1.9536, longitude = 30.0906
WHERE business_name = 'Tech2go phone lab';

-- Syrian shawarma - Kimironko area
UPDATE suppliers 
SET latitude = -1.9447, longitude = 30.1259
WHERE business_name = 'Syrian shawarma';

-- Kigali Trends - Nyarugenge District
UPDATE suppliers 
SET latitude = -1.9578, longitude = 30.0588
WHERE business_name = 'Kigali Trends';