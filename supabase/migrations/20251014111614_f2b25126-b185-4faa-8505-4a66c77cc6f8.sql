-- Add slide_duration field to promotional_slides table
ALTER TABLE promotional_slides 
ADD COLUMN slide_duration INTEGER DEFAULT 5 CHECK (slide_duration >= 1 AND slide_duration <= 30);

-- Add comment
COMMENT ON COLUMN promotional_slides.slide_duration IS 'Duration in seconds for how long this slide displays (1-30 seconds)';

-- Update existing slides to have default 5 second duration
UPDATE promotional_slides SET slide_duration = 5 WHERE slide_duration IS NULL;