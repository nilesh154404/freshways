
ALTER TABLE `marketing_contents`
  ADD COLUMN IF NOT EXISTS `sources` JSON NULL DEFAULT NULL
  COMMENT 'Medical/health source citations [{name, url}] — Apple App Store Guideline 1.4.1'
  AFTER `shareCount`;


