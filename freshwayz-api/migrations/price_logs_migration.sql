-- Migration: Create price_logs table for price history tracking
-- Date: 2026-02-04
-- Description: This migration creates a new price_logs table to track all price changes
--              and removes unused columns from daily_price table

-- Step 1: Create the new price_logs table
CREATE TABLE IF NOT EXISTS `price_logs` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `productId` INT NOT NULL,
    `vendorId` INT NOT NULL,
    `old_amount` DECIMAL(10, 2) NULL,
    `new_amount` DECIMAL(10, 2) NOT NULL,
    `old_mrp` DECIMAL(10, 2) NULL,
    `new_mrp` DECIMAL(10, 2) NOT NULL,
    `changedAt` DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (`id`),
    INDEX `IDX_PRODUCT_VENDOR` (`productId`, `vendorId`),
    INDEX `IDX_CHANGED_AT` (`changedAt`),
    CONSTRAINT `FK_price_logs_product` FOREIGN KEY (`productId`) REFERENCES `product`(`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_price_logs_vendor` FOREIGN KEY (`vendorId`) REFERENCES `vendor`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Remove previous_amount and previous_mrp_amount columns from daily_price (if they exist)
-- Note: Only run these if you previously added these columns
-- ALTER TABLE `daily_price` DROP COLUMN IF EXISTS `previous_amount`;
-- ALTER TABLE `daily_price` DROP COLUMN IF EXISTS `previous_mrp_amount`;

-- Step 3: Migrate existing data to price_logs (Optional)
-- This creates initial price log entries from current daily_price data
-- Uncomment if you want to populate price_logs with existing data
/*
INSERT INTO `price_logs` (`productId`, `vendorId`, `old_amount`, `new_amount`, `old_mrp`, `new_mrp`, `changedAt`)
SELECT 
    dp.productId,
    dp.vendorId,
    NULL as old_amount,
    dp.amount as new_amount,
    NULL as old_mrp,
    dp.mrp_amount as new_mrp,
    dp.createdAt as changedAt
FROM `daily_price` dp
WHERE dp.isActive = 1;
*/

-- Verification queries:
-- SELECT * FROM price_logs ORDER BY changedAt DESC LIMIT 10;
-- DESCRIBE price_logs;
