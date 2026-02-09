-- Add dummy price history for yesterday and 2 days ago for all products
-- This script creates realistic price change history

-- First, let's verify what products we have
SELECT * FROM daily_price LIMIT 5;

-- Insert price logs for 2 days ago (2026-02-02) with lower prices
INSERT INTO price_logs (productId, vendorId, old_amount, new_amount, old_mrp, new_mrp, changedAt)
SELECT 
    dp.productId,
    dp.vendorId,
    ROUND((dp.amount * 0.95), 2) as old_amount,
    ROUND((dp.amount * 0.93), 2) as new_amount,
    ROUND((dp.mrp_amount * 0.95), 2) as old_mrp,
    ROUND((dp.mrp_amount * 0.93), 2) as new_mrp,
    DATE_ADD(NOW(), INTERVAL -2 DAY)
FROM daily_price dp
WHERE dp.isActive = 1
ON DUPLICATE KEY UPDATE changedAt = changedAt;

-- Insert price logs for yesterday (2026-02-03) - price increased
INSERT INTO price_logs (productId, vendorId, old_amount, new_amount, old_mrp, new_mrp, changedAt)
SELECT 
    dp.productId,
    dp.vendorId,
    ROUND((dp.amount * 0.93), 2) as old_amount,
    ROUND((dp.amount * 0.98), 2) as new_amount,
    ROUND((dp.mrp_amount * 0.93), 2) as old_mrp,
    ROUND((dp.mrp_amount * 0.98), 2) as new_mrp,
    DATE_ADD(NOW(), INTERVAL -1 DAY)
FROM daily_price dp
WHERE dp.isActive = 1
ON DUPLICATE KEY UPDATE changedAt = changedAt;

-- Insert one more entry for yesterday - another price change
INSERT INTO price_logs (productId, vendorId, old_amount, new_amount, old_mrp, new_mrp, changedAt)
SELECT 
    dp.productId,
    dp.vendorId,
    ROUND((dp.amount * 0.98), 2) as old_amount,
    ROUND((dp.amount * 0.99), 2) as new_amount,
    ROUND((dp.mrp_amount * 0.98), 2) as old_mrp,
    ROUND((dp.mrp_amount * 0.99), 2) as new_mrp,
    DATE_ADD(DATE_ADD(NOW(), INTERVAL -1 DAY), INTERVAL 6 HOUR)
FROM daily_price dp
WHERE dp.isActive = 1
ON DUPLICATE KEY UPDATE changedAt = changedAt;

-- Verify the inserted records
SELECT 
    pl.id,
    p.label as product,
    v.businessName as vendor,
    pl.old_amount,
    pl.new_amount,
    pl.old_mrp,
    pl.new_mrp,
    pl.changedAt
FROM price_logs pl
JOIN product p ON pl.productId = p.id
JOIN vendor v ON pl.vendorId = v.id
ORDER BY pl.changedAt DESC
LIMIT 20;

-- Count total price logs
SELECT COUNT(*) as total_price_logs FROM price_logs;
